#!/usr/bin/env python3
"""migrar-fauna.py — Migración idempotente del catálogo de fauna (issue #10).

Lee el CSV de origen (`content/fauna/_origen/aves-especies.csv`) y genera una ficha
`content/fauna/aves/<slug>/index.md` por especie, conforme al esquema congelado en #9
(ver `content/fauna/aves/_ejemplo.md`). Empareja cada especie con su carpeta del banco
de imágenes (carpeta = nombre científico), deduplica, optimiza a WebP (web ~1600 px,
thumb ~600 px) y —con `--upload`— sube `raw/`, `web/` y `thumb/` al bucket GCS
`catalogo-aves-chirimoyo`. Los créditos salen del manifiesto `creditos_imagenes.json`.

IDEMPOTENCIA:
  * Fichas: por defecto NO se sobrescribe una ficha existente (las fichas son la fuente
    de verdad final y se curan a mano). Usa `--force` para regenerarlas desde el CSV.
  * Subidas: solo ocurren con `--upload` y omiten objetos ya presentes (salvo `--force`).

SEGURIDAD: no sube nada sin `--upload`. `google-cloud-storage` + credenciales solo se
necesitan para subir. Sin `--upload`, el script genera fichas y (opcionalmente, con
`--img-out`) escribe las variantes optimizadas localmente para revisión.

Ver el mapeo columna→ficha y el parseo de conservación en
`content/fauna/_origen/README.md`, y la decisión de storage en ADR-0016.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import re
import sys
import unicodedata
from pathlib import Path

# Rutas por defecto (relativas a la raíz del repo, dos niveles arriba de scripts/).
REPO = Path(__file__).resolve().parents[1]
DEFAULT_CSV = REPO / "content" / "fauna" / "_origen" / "aves-especies.csv"
# Raíz de fauna: cada ficha se escribe en <out>/<grupo>/<slug>/index.md (el grupo
# se deriva por fila; ver grupo_de). Para aves esto da content/fauna/aves/<slug>.
DEFAULT_OUT = REPO / "content" / "fauna"
DEFAULT_BANCO = Path(r"C:\Users\Frank\Downloads\Img guia aves\Imagenes aves")
DEFAULT_CREDITOS = Path(r"C:\Users\Frank\Downloads\Img guia aves\creditos_imagenes.json")
DEFAULT_BUCKET = "catalogo-aves-chirimoyo"

WEB_MAX = 1600
WEB_QUALITY = 82
THUMB_MAX = 600
THUMB_QUALITY = 75
IMG_EXTS = {".jpg", ".jpeg", ".png"}


# --------------------------------------------------------------------------- #
# Utilidades de texto
# --------------------------------------------------------------------------- #
def strip_accents(s: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c)
    )


def slugify(nombre_cientifico: str) -> str:
    """Ardea alba -> ardea-alba (minúsculas, sin acentos, espacios→'-')."""
    s = strip_accents(nombre_cientifico).lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def nkey(s: str) -> str:
    """Clave de comparación insensible a acentos/mayúsculas/espacios."""
    return re.sub(r"\s+", " ", strip_accents(s).lower().strip())


def yaml_q(s: str) -> str:
    """Escala YAML como string entre comillas dobles (seguro para ':' y demás)."""
    s = s.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{s}"'


# --------------------------------------------------------------------------- #
# Mapeo de enums y conservación
# --------------------------------------------------------------------------- #
MIGRATORIO = {
    "residente": "residente",
    "migratoria de invierno": "migratoria-invierno",
    "migratoria de verano": "migratoria-verano",
    "transitoria": "transitoria",
}
OCURRENCIA = {"comun": "comun", "poco comun": "poco-comun", "rara": "rara"}
DISTRIBUCION = {"nativa": "nativa", "introducida": "introducida"}

# Columna `grupo` del CSV → grupo/carpeta del esquema (ADR-0024). El CSV de aves no
# trae esta columna; en ese caso se usa --grupo-default.
GRUPO_FOLDER = {
    "ave": "aves", "aves": "aves",
    "anfibio": "anfibios", "anfibios": "anfibios",
    "reptil": "reptiles", "reptiles": "reptiles",
}

# Remap group-aware de `categoria` para herpetofauna: el CSV trae la forma/tipo
# ("Sapo", "Lagarto") y el esquema (#87) usa la clase taxonómica.
CATEGORIA_HERP = {
    "sapo": "Anuros", "rana": "Anuros",
    "salamandra": "Salamandras",
    "lagarto": "Lagartijas", "lagartija": "Lagartijas",
    "serpiente": "Serpientes", "culebra": "Serpientes",
    "tortuga": "Tortugas",
}


def grupo_de(row: dict, default: str) -> str:
    """Grupo/carpeta de una fila desde la columna `grupo` (o `default` si falta)."""
    raw = (row.get("grupo") or "").strip()
    if not raw:
        return default
    g = GRUPO_FOLDER.get(nkey(raw))
    if g is None:
        raise ValueError(f"grupo no reconocido: {raw!r}")
    return g

NOM059 = {
    "sin categoria de riesgo": "ninguno",
    "amenazada": "a",
    "proteccion especial": "pr",
    "en peligro de extincion": "p",
    "en peligro": "p",
    "probablemente extinta en el medio silvestre": "e",
    "probablemente extinta": "e",
}
IUCN = {
    "preocupacion menor": "LC",
    "casi amenazada": "NT",
    "vulnerable": "VU",
    "en peligro": "EN",
    "en peligro critico": "CR",
    "datos insuficientes": "DD",
    "no evaluada": "NE",
}


def map_enum(table: dict[str, str], value: str, campo: str) -> str:
    v = table.get(nkey(value))
    if v is None:
        raise ValueError(f"valor de {campo} no reconocido: {value!r}")
    return v


def parse_conservacion(texto: str) -> tuple[str, str | None]:
    """'Amenazada (NOM-059); Preocupación Menor (UICN)' -> ('a', 'LC')."""
    nom059: str | None = None
    iucn: str | None = None
    for parte in texto.split(";"):
        parte = parte.strip()
        if not parte:
            continue
        etiqueta = re.sub(r"\(.*?\)", "", parte).strip()
        k = nkey(etiqueta)
        if "nom-059" in nkey(parte) or "nom059" in nkey(parte):
            nom059 = NOM059.get(k)
        elif "uicn" in nkey(parte) or "iucn" in nkey(parte):
            iucn = IUCN.get(k)
    if nom059 is None:
        raise ValueError(f"no se pudo parsear NOM-059 de: {texto!r}")
    return nom059, iucn


# --------------------------------------------------------------------------- #
# Manifiesto de créditos
# --------------------------------------------------------------------------- #
def load_manifest(path: Path) -> dict[tuple[str, str], dict]:
    """Indexa el manifiesto por (nombre_cientifico_normalizado, basename)."""
    import json

    data = json.loads(path.read_text(encoding="utf-8"))
    idx: dict[tuple[str, str], dict] = {}
    for e in data.get("imagenes", []):
        archivo = e["archivo"].replace("\\", "/")
        basename = archivo.split("/")[-1]
        idx[(nkey(e["nombre_cientifico"]), basename)] = e
    return idx


def credito_de(entry: dict | None) -> dict:
    """Mapea una entrada del manifiesto a los campos de Foto."""
    if entry is None:
        return {"credito": "Crédito pendiente de atribuir (#10)"}
    foto = {
        "credito": entry.get("atribucion") or entry.get("autor") or "Crédito pendiente",
        "licencia": entry.get("licencia"),
        "creditoUrl": entry.get("foto_pagina") or entry.get("observacion_url"),
        "licenciaUrl": entry.get("licencia_url"),
    }
    return {k: v for k, v in foto.items() if v}


# --------------------------------------------------------------------------- #
# Audio (vocalización, #32)
# --------------------------------------------------------------------------- #
# El tipo en la ficha es estricto (canto | llamado). Los valores ambiguos del
# origen ('canto / llamado', 'uncertain') se omiten en vez de inventar un valor.
TIPO_VOZ = {"canto": "canto", "llamado": "llamado"}


def licencia_url(nombre: str) -> str | None:
    """Deriva la URL del texto legal CC desde el nombre, p. ej.
    'CC BY-NC-SA 4.0' -> https://creativecommons.org/licenses/by-nc-sa/4.0/."""
    m = re.search(r"CC\s+([A-Z-]+)\s+([\d.]+)", nombre.strip(), re.IGNORECASE)
    if not m:
        return None
    codigo = m.group(1).lower()  # by-nc-sa
    version = m.group(2)
    return f"https://creativecommons.org/licenses/{codigo}/{version}/"


def audio_ext(url: str) -> str:
    """Extensión real del audio derivada de la URL (sin query). iNaturalist sirve
    .mp3/.m4a/.mpga mezclados; xeno-canto sirve .mp3. Default .mp3 si no se infiere."""
    from urllib.parse import urlparse

    path = urlparse(url).path
    m = re.search(r"\.(mp3|m4a|mpga|mpeg|wav|ogg|oga)$", path, re.IGNORECASE)
    return f".{m.group(1).lower()}" if m else ".mp3"


def audio_de(row: dict) -> dict | None:
    """Construye el objeto Audio desde las columnas sonido_* del CSV. Devuelve
    None si la especie no tiene grabación. NO incluye calidad/país (fuera del
    esquema de la ficha; quedan solo en el CSV). No inventa atribución faltante."""
    sonido_id = row.get("sonido_id", "").strip()
    url = row.get("sonido_url", "").strip()
    # Sin grabación: vacío o marcador de faltante ("[no aplica]") en id o url.
    if not sonido_id or not url or FALTANTE.search(sonido_id) or FALTANTE.search(url):
        return None
    # El nombre del archivo se deriva del id, conservando la extensión real de la URL
    # (iNaturalist: .m4a/.mpga/.mp3). Si la descarga revela otro formato, --upload
    # lo reporta (ver main()).
    audio = {
        "archivo": f"{sonido_id}{audio_ext(url)}",
        "credito": row.get("sonido_autor", "").strip(),
        "creditoUrl": row.get("sonido_pagina", "").strip(),
        "licencia": row.get("sonido_licencia", "").strip(),
        "licenciaUrl": licencia_url(row.get("sonido_licencia", "")),
        "tipo": TIPO_VOZ.get(row.get("sonido_tipo", "").strip().lower()),
        "fuenteId": sonido_id,
    }
    return {k: v for k, v in audio.items() if v}


def descargar_audio(url: str) -> tuple[bytes, str]:
    """Descarga la grabación VERBATIM (sin tocar). Devuelve (bytes, content_type).
    No transcodifica ni recorta — obligatorio para las licencias ND (ADR-0017)."""
    import urllib.request

    req = urllib.request.Request(
        url,
        headers={"User-Agent": "comunidadchirimoyo-migracion/1.0 (+https://chirimoyo.org)"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
        ctype = (resp.headers.get("Content-Type") or "audio/mpeg").split(";")[0].strip()
    return data, ctype


# --------------------------------------------------------------------------- #
# Imágenes
# --------------------------------------------------------------------------- #
def optimizar(src: Path) -> tuple[bytes, bytes]:
    """Devuelve (web_webp, thumb_webp) optimizados, sin EXIF."""
    from PIL import Image

    def variante(im: Image.Image, lado: int, calidad: int) -> bytes:
        copia = im.copy()
        copia.thumbnail((lado, lado), Image.LANCZOS)
        buf = io.BytesIO()
        copia.save(buf, format="WEBP", quality=calidad, method=6)
        return buf.getvalue()

    with Image.open(src) as im:
        im = im.convert("RGB")
        return variante(im, WEB_MAX, WEB_QUALITY), variante(im, THUMB_MAX, THUMB_QUALITY)


# --------------------------------------------------------------------------- #
# Emisión de la ficha (template controlado, replica el estilo de _ejemplo.md)
# --------------------------------------------------------------------------- #
SECCIONES = [
    ("descripcion", "Descripción"),
    ("dieta_ecologia", "Dieta y ecología"),
    ("reproduccion", "Reproducción"),
    ("distribucion", "Distribución"),
    ("claves_apariencia", "Cómo identificarla"),
    (None, "Dónde y cuándo observarla"),  # combina zona + fechas
    ("aspectos_adicionales", "¿Sabías que?"),
]


# Vocabularios cerrados de los campos de búsqueda visual.
FORMAS = {"pato", "garza", "gallineta", "buceador", "playera", "rapaz", "pajaro"}
TAMANOS = {"muy-chica", "chica", "mediana", "grande", "muy-grande"}
COLORES = {"blanco", "negro", "cafe", "gris", "azul", "verde", "amarillo", "rojo", "naranja", "iridiscente"}
DONDES = {"nadando", "orilla", "volando", "arbol", "suelo", "poste"}

# Sinónimos de color del origen → vocabulario cerrado del esquema (sin acentos).
COLOR_SINONIMOS = {"dorado": "amarillo", "crema": "blanco", "beige": "cafe", "ocre": "naranja"}

# Meses por nombre (es) → número; el CSV de herps mezcla nombres y números en
# temporada_meses (p. ej. "junio; julio" vs "5;6;7").
MESES = {
    "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6,
    "julio": 7, "agosto": 8, "septiembre": 9, "setiembre": 9, "octubre": 10,
    "noviembre": 11, "diciembre": 12,
}


def parse_mes(tok: str) -> int:
    """Mes a número, aceptando número ('6') o nombre ('junio'/'Junio')."""
    t = nkey(tok)
    if t in MESES:
        return MESES[t]
    try:
        return int(float(tok))
    except ValueError:
        raise ValueError(f"temporada_meses: mes no reconocido: {tok!r}")


def _one(val: str, vocab: set[str], campo: str) -> str | None:
    """Valida un valor único contra su vocabulario (o None si vacío)."""
    v = (val or "").strip().lower()
    if not v:
        return None
    if v not in vocab:
        raise ValueError(f"{campo}: valor fuera del vocabulario: {val!r}")
    return v


def search_fields_yaml(row: dict, grupo: str) -> list[str]:
    """Líneas YAML de los campos de búsqueda visual (valida vocabularios). En
    herpetofauna se OMITEN `forma` y `donde` (su vocabulario cerrado está orientado a
    aves; decisión C de #87); `tamano`, `colores` y `featured` aplican a todos."""
    out: list[str] = []
    if grupo == "aves":
        forma = _one(row.get("forma", ""), FORMAS, "forma")
        if forma:
            out.append(f"forma: {forma}")
    tamano = _one(row.get("tamano", ""), TAMANOS, "tamano")
    if tamano:
        out.append(f"tamano: {tamano}")
    # El CSV mezcla separadores (`;` y `,`) y trae acentos/sinónimos; se normaliza.
    colores: list[str] = []
    for raw in re.split(r"[;,]", row.get("colores", "") or ""):
        c = strip_accents(raw).strip().lower()
        if not c:
            continue
        c = COLOR_SINONIMOS.get(c, c)
        if c not in COLORES:
            raise ValueError(f"colores: valor fuera del vocabulario: {c!r}")
        colores.append(c)
    if colores:
        out.append("colores: [" + ", ".join(colores) + "]")
    if grupo == "aves":
        donde = _one(row.get("donde", ""), DONDES, "donde")
        if donde:
            out.append(f"donde: {donde}")
    feat = (row.get("featured", "") or "").strip().lower()
    if feat in ("true", "sí", "si", "1", "x"):
        out.append("featured: true")
    elif feat and feat not in ("false", "no", "0"):
        raise ValueError(f"featured: valor no booleano: {row.get('featured')!r}")
    return out


# Marcadores de "dato faltante" que el experto usa en celdas sin valor
# (incluye "[no aplica]", p. ej. especies sin canto).
FALTANTE = re.compile(r"dato\s*faltante|^n/?a$|^-+$|^pendiente$|^sin\s*dato$|no\s*aplica", re.I)


def _val(row: dict, col: str) -> str:
    """Valor de una columna, tratando los marcadores de faltante como vacío."""
    v = (row.get(col) or "").strip()
    return "" if (not v or FALTANTE.search(v)) else v


def _rango(s: str) -> list | None:
    """'80-104' / '9.5-11.25' → [min, max] (int si es entero, float si no)."""
    partes = [p.strip() for p in re.split(r"[-–—]", s) if p.strip()]
    if len(partes) != 2:
        return None
    try:
        nums = [float(p) for p in partes]
    except ValueError:
        return None
    return [int(n) if n.is_integer() else n for n in nums]


def detalle_fields_yaml(row: dict) -> list[str]:
    """Líneas YAML de los campos Tier B de la ficha de detalle (tolerante a faltantes)."""
    out: list[str] = []
    if (aut := _val(row, "autoridad")):
        out.append(f"autoridad: {yaml_q(aut)}")
    otros = [x.strip() for x in _val(row, "otros_nombres").split(";") if x.strip()]
    if otros:
        out.append("otrosNombres:")
        out += [f"  - {yaml_q(o)}" for o in otros]
    if (env := _val(row, "envergadura")):
        out.append(f"envergadura: {yaml_q(env)}")
    if (mh := _val(row, "mejor_hora")):
        out.append(f"mejorHora: {yaml_q(mh)}")
    if (pq := _val(row, "pull_quote")):
        out.append(f"pullQuote: {yaml_q(pq)}")
    tam, pes = _rango(_val(row, "tamano_cm")), _rango(_val(row, "peso_g"))
    criterio = _val(row, "talla_criterio")
    if tam or pes:
        out.append("medidas:")
        if tam:
            out.append(f"  tamanoCm: [{tam[0]}, {tam[1]}]")
        if pes:
            out.append(f"  pesoG: [{pes[0]}, {pes[1]}]")
        if criterio:
            out.append(f"  criterio: {yaml_q(criterio)}")
    hab = [x.strip() for x in _val(row, "habitat").split(";") if x.strip()]
    if hab:
        out.append("habitat:")
        out += [f"  - {yaml_q(h)}" for h in hab]
    meses = [m.strip() for m in _val(row, "temporada_meses").split(";") if m.strip()]
    notas = _val(row, "temporada_notas")
    if meses or notas:
        out.append("temporada:")
        if meses:
            out.append("  meses: [" + ", ".join(str(parse_mes(m)) for m in meses) + "]")
        if notas:
            out.append(f"  notas: {yaml_q(notas)}")
    return out


def emit_ficha(slug: str, grupo: str, row: dict, fotos: list[dict]) -> str:
    nom059, iucn = parse_conservacion(row["estatus_conservacion_detallado"])
    fuentes = [f.strip() for f in row["fuentes"].split(";") if f.strip()]
    nombre_comun = row["nombre_comun"].strip()
    nombre_cientifico = row["nombre_cientifico"].strip()
    # Categoría group-aware: aves conserva el gremio ecológico; herpetofauna remapea
    # la forma/tipo del CSV a la clase taxonómica (#87).
    categoria = row["categoria"].strip()
    if grupo != "aves":
        cat = CATEGORIA_HERP.get(nkey(categoria))
        if cat is None:
            raise ValueError(f"categoria de herpetofauna no reconocida: {categoria!r}")
        categoria = cat
    # Eje de presencia: aves usa `estatus_migratorio`; herpetofauna usa `presencia`.
    presencia = row.get("estatus_migratorio", "").strip() or row.get("presencia", "").strip()
    # Una especie introducida residente puede traer un término de distribución
    # ("Introducida"/"Nativa") filtrado en la columna `presencia`; se trata como
    # residente (el eje de distribución lo captura `estatus_distribucion`).
    if nkey(presencia) in DISTRIBUCION:
        presencia = "residente"

    L: list[str] = ["---"]
    L.append(f"slug: {slug}")
    L.append(f"grupo: {grupo}")
    L.append(f"categoria: {yaml_q(categoria)}")
    L.append(f"nombreComun: {yaml_q(nombre_comun)}")
    L.append(f"nombreCientifico: {yaml_q(nombre_cientifico)}")
    L.append(f"orden: {yaml_q(row['orden'].strip())}")
    L.append(f"familia: {yaml_q(row['familia'].strip())}")
    L.append(f"genero: {yaml_q(row['genero'].strip())}")
    L.append(f"estatusMigratorio: {map_enum(MIGRATORIO, presencia, 'estatusMigratorio')}")
    L.append(f"gradoOcurrencia: {map_enum(OCURRENCIA, row['grado_ocurrencia'], 'gradoOcurrencia')}")
    L.append(f"estatusDistribucion: {map_enum(DISTRIBUCION, row['estatus_distribucion'], 'estatusDistribucion')}")
    L.append("conservacion:")
    L.append(f"  nom059: {nom059}")
    if iucn:
        L.append(f"  iucn: {iucn}")
    if row.get("simbologia_recomendada", "").strip():
        L.append(f"simbologia: {yaml_q(row['simbologia_recomendada'].strip())}")
    L.extend(search_fields_yaml(row, grupo))
    L.extend(detalle_fields_yaml(row))
    L.append("fuentes:")
    for f in fuentes:
        L.append(f"  - {yaml_q(f)}")
    L.append("fotos:")
    for foto in fotos:
        L.append(f"  - archivo: {yaml_q(foto['archivo'])}")
        L.append(f"    credito: {yaml_q(foto['credito'])}")
        L.append(f"    alt: {yaml_q(foto['alt'])}")
        if foto.get("licencia"):
            L.append(f"    licencia: {yaml_q(foto['licencia'])}")
        if foto.get("creditoUrl"):
            L.append(f"    creditoUrl: {yaml_q(foto['creditoUrl'])}")
        if foto.get("licenciaUrl"):
            L.append(f"    licenciaUrl: {yaml_q(foto['licenciaUrl'])}")
    audio = audio_de(row)
    if audio:
        L.append("audios:")
        L.append(f"  - archivo: {yaml_q(audio['archivo'])}")
        if audio.get("credito"):
            L.append(f"    credito: {yaml_q(audio['credito'])}")
        if audio.get("tipo"):
            L.append(f"    tipo: {audio['tipo']}")
        if audio.get("fuenteId"):
            L.append(f"    fuenteId: {yaml_q(audio['fuenteId'])}")
        if audio.get("licencia"):
            L.append(f"    licencia: {yaml_q(audio['licencia'])}")
        if audio.get("creditoUrl"):
            L.append(f"    creditoUrl: {yaml_q(audio['creditoUrl'])}")
        if audio.get("licenciaUrl"):
            L.append(f"    licenciaUrl: {yaml_q(audio['licenciaUrl'])}")
    L.append("---")
    L.append("")

    for col, titulo in SECCIONES:
        if titulo == "Dónde y cuándo observarla":
            zona = row.get("claves_zona_observacion", "").strip()
            fechas = row.get("claves_fechas_observacion", "").strip()
            cuerpo = " ".join(p for p in [zona, fechas] if p)
        else:
            cuerpo = row.get(col, "").strip()
        if not cuerpo:
            continue
        L.append(f"## {titulo}")
        L.append("")
        L.append(cuerpo)
        L.append("")

    return "\n".join(L).rstrip() + "\n"


# --------------------------------------------------------------------------- #
# GCS
# --------------------------------------------------------------------------- #
class Uploader:
    """Sube las variantes a GCS. Las optimizadas (web/thumb) van al bucket público;
    las crudas (raw) al bucket de archivo privado (ver ADR-0016). Si no se da un
    bucket de archivo, las crudas no se suben."""

    def __init__(self, bucket: str, raw_bucket: str | None, project: str, force: bool):
        from google.cloud import storage  # import perezoso (solo con --upload)
        from google.auth.exceptions import DefaultCredentialsError

        try:
            # project explícito: evita depender del proyecto activo de gcloud
            # (que puede ser otro) y fija la cuota/billing en el correcto.
            self.client = storage.Client(project=project)
        except DefaultCredentialsError as exc:
            raise SystemExit(
                "ERROR: no hay Application Default Credentials (ADC).\n"
                "  `gcloud auth login` autentica el CLI, pero las librerías de Python\n"
                "  necesitan ADC. Ejecuta:\n\n"
                "      gcloud auth application-default login\n\n"
                f"  Detalle: {exc}"
            )
        self.bucket = self._open(bucket, project)
        self.raw_bucket = self._open(raw_bucket, project) if raw_bucket else None
        self.force = force

    def _open(self, name: str, project: str):
        b = self.client.bucket(name)
        if not b.exists():
            raise SystemExit(
                f"ERROR: el bucket gs://{name} no existe o no es accesible con tu\n"
                f"  cuenta en el proyecto '{project}'. Créalo primero, p. ej.:\n\n"
                f"      gcloud storage buckets create gs://{name} \\\n"
                f"          --project={project} --location=northamerica-south1 \\\n"
                f"          --uniform-bucket-level-access\n"
            )
        return b

    def _put_bytes(self, bkt, key: str, data: bytes, content_type: str) -> bool:
        blob = bkt.blob(key)
        if blob.exists() and not self.force:
            return False
        blob.upload_from_string(data, content_type=content_type)
        return True

    def put_web(self, key: str, data: bytes, content_type: str) -> bool:
        return self._put_bytes(self.bucket, key, data, content_type)

    def put_audio(self, key: str, data: bytes, content_type: str) -> bool:
        return self._put_bytes(self.bucket, key, data, content_type)

    def put_raw(self, key: str, src: Path) -> bool:
        if self.raw_bucket is None:
            return False
        blob = self.raw_bucket.blob(key)
        if blob.exists() and not self.force:
            return False
        blob.upload_from_filename(str(src))
        return True

    def put_raw_bytes(self, key: str, data: bytes, content_type: str) -> bool:
        if self.raw_bucket is None:
            return False
        blob = self.raw_bucket.blob(key)
        if blob.exists() and not self.force:
            return False
        blob.upload_from_string(data, content_type=content_type)
        return True


# --------------------------------------------------------------------------- #
# Proceso principal
# --------------------------------------------------------------------------- #
def main() -> int:
    ap = argparse.ArgumentParser(description="Migrar el catálogo de fauna (#10).")
    ap.add_argument("--csv", type=Path, default=DEFAULT_CSV)
    ap.add_argument("--banco", type=Path, default=DEFAULT_BANCO)
    ap.add_argument("--creditos", type=Path, default=DEFAULT_CREDITOS)
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT,
                    help="Raíz de fauna; cada ficha va a <out>/<grupo>/<slug>/.")
    ap.add_argument("--grupo-default", default="aves",
                    help="Grupo cuando el CSV no trae columna `grupo` (p. ej. aves).")
    ap.add_argument("--bucket", default=DEFAULT_BUCKET,
                    help="Bucket público para web/ y thumb/.")
    ap.add_argument("--raw-bucket", default=DEFAULT_BUCKET + "-raw",
                    help="Bucket privado de archivo para las crudas; '' para no subirlas.")
    ap.add_argument("--project", default="chirimoyo",
                    help="Proyecto GCP del bucket (no el proyecto activo de gcloud).")
    ap.add_argument("--img-out", type=Path, default=None,
                    help="Escribe las variantes web/thumb localmente para revisión.")
    ap.add_argument("--upload", action="store_true", help="Sube raw/web/thumb a GCS.")
    ap.add_argument("--no-images", action="store_true", help="Solo genera fichas (omite imágenes).")
    ap.add_argument("--solo-fotos", action="store_true",
                    help="Procesa/sube imágenes y NO escribe fichas (ingesta incremental; "
                         "preserva las ediciones del MD, p. ej. distribucion).")
    ap.add_argument("--no-audio", action="store_true",
                    help="Omite la descarga/subida de audio (las fichas igual emiten audios:).")
    ap.add_argument("--force", action="store_true",
                    help="Regenera fichas existentes y re-sube objetos.")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args()

    rows = list(csv.DictReader(args.csv.open(encoding="utf-8")))
    if args.limit:
        rows = rows[: args.limit]

    manifest = load_manifest(args.creditos) if not args.no_images else {}
    uploader = (
        Uploader(args.bucket, args.raw_bucket or None, args.project, args.force)
        if args.upload
        else None
    )

    # Carpetas del banco indexadas por nombre científico normalizado.
    bank_dirs: dict[str, Path] = {}
    if args.banco.exists():
        for d in args.banco.iterdir():
            if d.is_dir():
                bank_dirs[nkey(d.name)] = d

    slugs_vistos: dict[str, str] = {}
    errores: list[str] = []
    audio_errores: list[str] = []
    sin_carpeta: list[str] = []
    fichas_escritas = fichas_saltadas = 0
    subidas = 0
    audios_subidos = 0

    for row in rows:
        sci = row["nombre_cientifico"].strip()
        slug = slugify(sci)

        if slug in slugs_vistos:
            errores.append(
                f"colisión de slug {slug!r}: {slugs_vistos[slug]!r} vs {sci!r}"
            )
            continue
        slugs_vistos[slug] = sci

        try:
            grupo = grupo_de(row, args.grupo_default)
        except ValueError as exc:
            errores.append(f"{sci} ({slug}): {exc}")
            continue

        # --- Imágenes / fotos[] ---
        fotos: list[dict] = []
        alt = f"{row['nombre_comun'].strip()} ({sci})"
        bank = bank_dirs.get(nkey(sci))
        if not args.no_images:
            if bank is None:
                sin_carpeta.append(sci)
            else:
                vistos_hash: set[str] = set()
                archivos = sorted(
                    p for p in bank.iterdir()
                    if p.suffix.lower() in IMG_EXTS and p.is_file()
                )
                for src in archivos:
                    h = hashlib.md5(src.read_bytes()).hexdigest()
                    if h in vistos_hash:
                        continue
                    vistos_hash.add(h)

                    archivo_webp = src.stem + ".webp"
                    entry = manifest.get((nkey(sci), src.name))
                    foto = {"archivo": archivo_webp, "alt": alt, **credito_de(entry)}
                    fotos.append(foto)

                    # Solo optimizamos si vamos a subir o a guardar local; para
                    # generar fichas basta con el nombre + crédito (más rápido).
                    if not (uploader or args.img_out):
                        continue
                    web_b, thumb_b = optimizar(src)
                    if uploader:
                        # En el bucket de archivo dedicado las crudas van directo
                        # bajo <slug>/ (sin prefijo `raw/`, que sería redundante).
                        if uploader.put_raw(f"{slug}/{src.name}", src):
                            subidas += 1
                        if uploader.put_web(f"web/{slug}/{archivo_webp}", web_b, "image/webp"):
                            subidas += 1
                        if uploader.put_web(f"thumb/{slug}/{archivo_webp}", thumb_b, "image/webp"):
                            subidas += 1
                    else:
                        for variante, data in (("web", web_b), ("thumb", thumb_b)):
                            dest = args.img_out / variante / slug / archivo_webp
                            dest.parent.mkdir(parents=True, exist_ok=True)
                            dest.write_bytes(data)

        # --- Audio / vocalización (#32) ---
        # Sube la grabación VERBATIM (sin transcodificar ni recortar; obligatorio
        # para las licencias ND, ver ADR-0017): copia pública bajo audio/<slug>/ y
        # cruda bajo <slug>/ en el bucket de archivo. Un fallo de descarga se
        # reporta por especie sin abortar ni subir objetos parciales.
        if uploader and not args.no_audio:
            audio = audio_de(row)
            if audio:
                key_pub = f"audio/{slug}/{audio['archivo']}"
                ya_existe = uploader.bucket.blob(key_pub).exists()
                if ya_existe and not args.force:
                    pass  # ya subido; no re-descargar
                else:
                    try:
                        data, ctype = descargar_audio(row["sonido_url"].strip())
                        if not ctype.startswith("audio/"):
                            audio_errores.append(
                                f"{sci} ({slug}): content-type no-audio {ctype!r} "
                                f"para {audio['archivo']}"
                            )
                        if uploader.put_audio(key_pub, data, ctype or "audio/mpeg"):
                            audios_subidos += 1
                        if uploader.put_raw_bytes(f"{slug}/{audio['archivo']}", data, ctype or "audio/mpeg"):
                            audios_subidos += 1
                    except Exception as exc:
                        audio_errores.append(f"{sci} ({slug}): fallo al descargar audio: {exc}")

        # --- Validación de núcleo ---
        faltan = []
        for campo in ("nombre_comun", "nombre_cientifico", "categoria", "orden", "familia"):
            if not row.get(campo, "").strip():
                faltan.append(campo)
        if not row.get("estatus_conservacion_detallado", "").strip():
            faltan.append("estatus_conservacion_detallado")
        if not args.no_images and not fotos:
            faltan.append("fotos (≥1)")
        if not row.get("descripcion", "").strip():
            faltan.append("descripcion")
        if faltan:
            errores.append(f"{sci} ({slug}): núcleo incompleto: {', '.join(faltan)}")
            continue

        # --- Emitir ficha (omitida con --solo-fotos: ingesta incremental que
        #     NO regenera la ficha, para preservar campos MD-only como
        #     distribucion.residente; ver #90/#93) ---
        if args.solo_fotos:
            continue
        ficha_dir = args.out / grupo / slug
        ficha_path = ficha_dir / "index.md"
        if ficha_path.exists() and not args.force:
            fichas_saltadas += 1
        else:
            try:
                md = emit_ficha(slug, grupo, row, fotos)
                try:  # auto-verificación opcional: re-parsear el frontmatter emitido
                    import yaml
                    yaml.safe_load(md.split("---", 2)[1])
                except ImportError:
                    pass  # PyYAML no instalado: se omite la auto-verificación
            except Exception as exc:
                errores.append(f"{sci} ({slug}): {exc}")
                continue
            ficha_dir.mkdir(parents=True, exist_ok=True)
            ficha_path.write_text(md, encoding="utf-8")
            fichas_escritas += 1

    # --- Reporte ---
    carpetas_sin_especie = sorted(
        d.name for k, d in bank_dirs.items()
        if k not in {nkey(r["nombre_cientifico"]) for r in rows}
    )
    print(f"Especies en CSV:        {len(rows)}")
    print(f"Fichas escritas:        {fichas_escritas}")
    print(f"Fichas saltadas (exist):{fichas_saltadas}")
    if not args.no_images:
        modo = "subidas a GCS" if args.upload else ("escritas local" if args.img_out else "en memoria")
        print(f"Variantes de imagen:    {modo} ({subidas} objetos subidos)" if args.upload
              else f"Imágenes procesadas:    {modo}")
    if args.upload and not args.no_audio:
        print(f"Audios subidos a GCS:   {audios_subidos} objetos")
    if sin_carpeta:
        print(f"Especies SIN carpeta de fotos ({len(sin_carpeta)}): {', '.join(sin_carpeta)}")
    if carpetas_sin_especie:
        print(f"Carpetas SIN especie en CSV ({len(carpetas_sin_especie)}): {', '.join(carpetas_sin_especie)}")
    if audio_errores:
        print(f"\nAVISOS DE AUDIO ({len(audio_errores)}):", file=sys.stderr)
        for e in audio_errores:
            print(f"  - {e}", file=sys.stderr)
    if errores:
        print(f"\nERRORES ({len(errores)}):", file=sys.stderr)
        for e in errores:
            print(f"  - {e}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
