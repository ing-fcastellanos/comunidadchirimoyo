#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""descargar-imagenes-inaturalist.py — Siembra fotos con licencia LIBRE para una
especie nueva, desde iNaturalist, hacia el banco de imágenes que consume
`scripts/migrar-fauna.py`.

Para CADA especie indicada, busca observaciones de **grado de investigación** con
licencia **CC0 / CC BY / CC BY-SA** (reutilizables incluso para uso comercial),
priorizando **Veracruz → México → global** para acercarse a fotos de la región del
Chirimoyo. Descarga las fotos a `<banco>/<Nombre cientifico>/` y **fusiona** los
créditos (autor, licencia, URL de licencia, URL de la observación) en el manifiesto
`creditos_imagenes.json`, SIN sobrescribir las entradas de otras especies.

Solo usa la librería estándar de Python 3. No sube nada: la subida a GCS la hace
`migrar-fauna.py --upload`. Ver la guía completa del proceso en
`docs/guias/agregar-una-ave.md` y la política de licencias en el spec
`migracion-fauna`.

Ejemplos:
    # Una especie (nombre de búsqueda = nombre científico):
    python scripts/descargar-imagenes-inaturalist.py \
        --cientifico "Psarocolius montezuma" --comun "Oropéndola de Moctezuma"

    # Cuando el nombre de búsqueda en iNat difiere del científico curado:
    python scripts/descargar-imagenes-inaturalist.py \
        --cientifico "Cyanocorax morio" --comun "Chara Pea" --buscar "Psilorhinus morio"
"""
from __future__ import annotations

import argparse
import json
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

# --------------------------------------------------------------------------- #
# Configuración (defaults alineados con migrar-fauna.py para encadenar)
# --------------------------------------------------------------------------- #
DEFAULT_BANCO = Path(r"C:\Users\Frank\Downloads\Img guia aves\Imagenes aves")
DEFAULT_CREDITOS = Path(r"C:\Users\Frank\Downloads\Img guia aves\creditos_imagenes.json")

FOTOS_POR_ESPECIE = 10
LICENCIAS = "cc0,cc-by,cc-by-sa"  # seguras para web pública (incluso comercial)
TAMANO = "large"                  # large | medium | original
PAUSA = 1.0                       # segundos entre peticiones (cortesía con la API)
UA = "GuiaAvesChirimoyo/1.0 (descarga educativa de fotos CC; +https://chirimoyo.org)"

API = "https://api.inaturalist.org/v1"
CTX = ssl.create_default_context()

LICENCIA_INFO = {
    "cc0":      ("CC0 1.0",      "https://creativecommons.org/publicdomain/zero/1.0/"),
    "cc-by":    ("CC BY 4.0",    "https://creativecommons.org/licenses/by/4.0/"),
    "cc-by-sa": ("CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/"),
}


# --------------------------------------------------------------------------- #
# Utilidades HTTP
# --------------------------------------------------------------------------- #
def get_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60, context=CTX) as r:
        return json.loads(r.read().decode("utf-8"))


def descargar(url: str, destino: Path) -> int:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120, context=CTX) as r:
        data = r.read()
    destino.write_bytes(data)
    return len(data)


def resolver_place(nombre: str) -> int | None:
    """Resuelve un nombre de lugar (p. ej. 'Veracruz') a su place_id de iNaturalist."""
    try:
        q = urllib.parse.quote(nombre)
        d = get_json(f"{API}/places/autocomplete?q={q}")
        for res in d.get("results", []):
            if res.get("name", "").lower() == nombre.lower():
                return res.get("id")
        if d.get("results"):
            return d["results"][0].get("id")
    except Exception as e:
        print(f"  (no se pudo resolver lugar {nombre!r}: {e})")
    return None


# --------------------------------------------------------------------------- #
# Búsqueda de fotos
# --------------------------------------------------------------------------- #
def buscar_fotos(taxon_q: str, place_id: int | None, faltan: int,
                 vistos: set[int], licencias: str) -> list[dict]:
    """Devuelve hasta `faltan` fotos CC de una especie, con un filtro de lugar dado.
    Una foto por observación para maximizar la variedad."""
    fotos: list[dict] = []
    params = {
        "taxon_name": taxon_q,
        "photo_license": licencias,
        "quality_grade": "research",
        "per_page": "60",
        "order_by": "votes", "order": "desc",
        "photos": "true", "locale": "es",
    }
    if place_id:
        params["place_id"] = str(place_id)
    url = f"{API}/observations?" + urllib.parse.urlencode(params)
    try:
        data = get_json(url)
    except Exception as e:
        print("  error API:", e)
        return fotos
    info = dict(LICENCIA_INFO)
    for obs in data.get("results", []):
        if len(fotos) >= faltan:
            break
        obs_id = obs.get("id")
        obs_url = obs.get("uri") or f"https://www.inaturalist.org/observations/{obs_id}"
        user = obs.get("user") or {}
        for ph in (obs.get("photos") or [])[:1]:
            pid = ph.get("id")
            if pid in vistos:
                continue
            lic = ph.get("license_code")
            if lic not in info:
                continue
            sq = ph.get("url") or ""
            img_url = sq.replace("/square.", f"/{TAMANO}.")
            lic_nombre, lic_url = info[lic]
            fotos.append({
                "foto_id": pid,
                "img_url": img_url,
                "atribucion": ph.get("attribution", ""),
                "autor": user.get("name") or user.get("login") or "Desconocido",
                "usuario_inat": user.get("login"),
                "licencia": lic_nombre,
                "licencia_url": lic_url,
                "observacion_url": obs_url,
                "foto_pagina": f"https://www.inaturalist.org/photos/{pid}",
                "fuente": "iNaturalist",
            })
            vistos.add(pid)
            break
    return fotos


# --------------------------------------------------------------------------- #
# Manifiesto (merge, no sobrescribir)
# --------------------------------------------------------------------------- #
def cargar_manifiesto(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {
        "fuente_principal": "iNaturalist (https://www.inaturalist.org)",
        "licencias_incluidas": list(LICENCIA_INFO.keys()),
        "nota": "Cada imagen conserva el crédito de su autor. Respeta la licencia indicada al publicar.",
        "total_imagenes": 0,
        "imagenes": [],
    }


def nkey(s: str) -> str:
    return " ".join(s.lower().split())


# --------------------------------------------------------------------------- #
# Proceso principal
# --------------------------------------------------------------------------- #
def main() -> int:
    ap = argparse.ArgumentParser(description="Sembrar fotos CC de iNaturalist para una especie nueva.")
    ap.add_argument("--cientifico", required=True, help="Nombre científico curado (p. ej. 'Psarocolius montezuma').")
    ap.add_argument("--comun", required=True, help="Nombre común (p. ej. 'Oropéndola de Moctezuma').")
    ap.add_argument("--buscar", default=None,
                    help="Nombre de búsqueda en iNat si difiere del científico (p. ej. sinónimo).")
    ap.add_argument("--banco", type=Path, default=DEFAULT_BANCO, help="Carpeta del banco de imágenes.")
    ap.add_argument("--creditos", type=Path, default=DEFAULT_CREDITOS, help="Manifiesto creditos_imagenes.json.")
    ap.add_argument("--fotos", type=int, default=FOTOS_POR_ESPECIE, help="Máximo de fotos a descargar.")
    ap.add_argument("--licencias", default=LICENCIAS, help="Licencias CC aceptadas (subset de cc0,cc-by,cc-by-sa).")
    args = ap.parse_args()

    cientifico = args.cientifico.strip()
    comun = args.comun.strip()
    taxon_q = (args.buscar or cientifico).strip()

    print("Resolviendo lugares (Veracruz / México)...")
    veracruz = resolver_place("Veracruz")
    mexico = resolver_place("Mexico")
    print(f"  Veracruz place_id = {veracruz} | Mexico place_id = {mexico}")

    carpeta = args.banco / cientifico
    carpeta.mkdir(parents=True, exist_ok=True)

    print(f"\n== {comun} ({cientifico}) ==")
    vistos: set[int] = set()
    fotos: list[dict] = []
    for place in (veracruz, mexico, None):  # región → país → global
        if len(fotos) >= args.fotos:
            break
        nuevas = buscar_fotos(taxon_q, place, args.fotos - len(fotos), vistos, args.licencias)
        fotos.extend(nuevas)
        time.sleep(PAUSA)

    if not fotos:
        print("  !! Sin fotos CC encontradas. Revisa el nombre de búsqueda (--buscar) o las licencias.")
        return 1

    slug = cientifico.replace(" ", "_")
    nuevos: list[dict] = []
    for i, f in enumerate(fotos[: args.fotos], 1):
        ext = Path(f["img_url"].split("?")[0]).suffix or ".jpg"
        nombre = f"{slug}_{i:02d}{ext}"
        destino = carpeta / nombre
        try:
            n = descargar(f["img_url"], destino)
            print(f"  [{i:2d}] {nombre}  ({n // 1024} KB)  {f['licencia']}")
        except Exception as e:
            print(f"  [{i:2d}] ERROR al descargar: {e}")
            continue
        registro = {
            "nombre_comun": comun,
            "nombre_cientifico": cientifico,
            "archivo": str(Path("Imagenes aves") / cientifico / nombre),
        }
        registro.update(f)
        nuevos.append(registro)
        time.sleep(PAUSA)

    # --- MERGE en el manifiesto: reemplaza solo las entradas de esta especie ---
    data = cargar_manifiesto(args.creditos)
    imagenes = [e for e in data.get("imagenes", [])
                if nkey(e.get("nombre_cientifico", "")) != nkey(cientifico)]
    imagenes.extend(nuevos)
    data["imagenes"] = imagenes
    data["total_imagenes"] = len(imagenes)
    args.creditos.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nListo: {len(nuevos)} fotos de {cientifico}. "
          f"Manifiesto ahora con {len(imagenes)} entradas: {args.creditos}")
    print("Siguiente paso: agrega la fila al CSV y corre migrar-fauna.py --upload "
          "(ver docs/guias/agregar-una-ave.md).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
