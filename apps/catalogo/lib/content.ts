/* content.ts — acceso al contenido de fauna desde la raíz del repo, en build.
   Lee y valida las fichas reales (`content/fauna/<grupo>/<slug>/index.md`).
   Solo se usa en build (Server Components / generateStaticParams). */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/** Raíz del contenido (content/). Por defecto relativo a la raíz del monorepo;
    override con la variable de entorno CONTENT_DIR. */
export const CONTENT_ROOT =
  process.env.CONTENT_DIR ?? path.resolve(process.cwd(), "../../content");

export const FAUNA_DIR = path.join(CONTENT_ROOT, "fauna");

/** Base pública del bucket GCS donde viven las imágenes de fauna. Las fichas
    guardan solo el nombre de archivo; la URL se compone por prefijo (`web` para
    detalle, `thumb` para cards). Ver ADR-0016. Override con
    `NEXT_PUBLIC_FAUNA_CDN_BASE` (p. ej. un dominio/CDN propio en el futuro). */
export const FAUNA_CDN_BASE =
  process.env.NEXT_PUBLIC_FAUNA_CDN_BASE ??
  "https://storage.googleapis.com/catalogo-aves-chirimoyo";

export type VarianteImagen = "web" | "thumb";

/** Compone la URL pública de una foto: `${BASE}/<variante>/<slug>/<archivo>`. */
export function fotoUrl(
  slug: string,
  archivo: string,
  variante: VarianteImagen,
): string {
  return `${FAUNA_CDN_BASE}/${variante}/${slug}/${archivo}`;
}

/* ---- Tipos del esquema de ficha (esquema congelado en #9) ----
   Ver el contrato completo en content/README.md y el change
   `definir-esquema-ficha-fauna`. Una ficha = frontmatter YAML (datos atómicos,
   los campos de abajo) + cuerpo Markdown con secciones `##` convenidas (`cuerpo`). */

/** Filtro macro del catálogo. Las anfibios/reptiles llegan en Fase 2. */
export type Grupo = "aves" | "anfibios-reptiles";

/** Gremio ecológico (sub-filtro). Lista abierta; valores conocidos de la fuente. */
export type Categoria =
  | "Vadeadoras"
  | "Nadadoras"
  | "Playeras"
  | "Voladoras"
  | "Rapaces y Carroñeras"
  | "Terrestres"
  | (string & {});

export type EstatusMigratorio =
  | "residente"
  | "migratoria-invierno"
  | "migratoria-verano"
  | "transitoria";
export type GradoOcurrencia = "comun" | "poco-comun" | "rara";
export type EstatusDistribucion = "nativa" | "introducida";

/** Categoría de riesgo NOM-059-SEMARNAT: protección especial, amenazada,
    en peligro, probablemente extinta en el medio silvestre, o ninguna. */
export type Nom059 = "pr" | "a" | "p" | "e" | "ninguno";

/** Secciones `##` convenidas del cuerpo Markdown (en este orden, las que existan).
    `descripcion` siempre presente. Sirve de referencia para parsear/renderizar. */
export type SeccionFicha =
  | "descripcion"
  | "dieta-ecologia"
  | "reproduccion"
  | "distribucion"
  | "como-identificarla"
  | "donde-y-cuando-observarla"
  | "sabias-que";

export interface Conservacion {
  nom059: Nom059;
  iucn?: string;
  notas?: string;
}

export interface Medidas {
  /** Rango de longitud en cm: [min, max]. */
  tamanoCm?: [number, number];
  /** Rango de peso en gramos: [min, max]. */
  pesoG?: [number, number];
  notas?: string;
}

export interface Temporada {
  /** Meses de avistamiento (1–12). Opcional: derivado best-effort de la prosa. */
  meses?: number[];
  notas?: string;
}

export interface Foto {
  /** Nombre del archivo de la imagen (p. ej. `Ardea_alba_01.webp`).
      La URL se compone con `fotoUrl(slug, archivo, variante)`. */
  archivo: string;
  /** Autor o fuente de la foto. Obligatorio. */
  credito: string;
  /** Texto alternativo (accesibilidad; string traducible). Obligatorio. */
  alt: string;
  licencia?: string;
  /** Enlace a la observación/foto original (atribución TASL de CC BY/BY-SA). */
  creditoUrl?: string;
  /** Enlace al texto legal de la licencia. */
  licenciaUrl?: string;
}

export interface Audio {
  /** Nombre del archivo de audio (p. ej. `canto-1.mp3`). */
  archivo: string;
  credito: string;
  descripcion?: string;
  licencia?: string;
}

export interface FichaEspecie {
  // --- Identidad ---
  /** Derivado del nombre científico (binomio → kebab-case); = nombre de la carpeta. */
  slug: string;
  grupo: Grupo;
  categoria: Categoria;
  nombreComun: string;
  nombreCientifico: string;
  // --- Taxonomía ---
  orden: string;
  familia: string;
  genero: string;
  // --- Estatus (3 ejes) ---
  estatusMigratorio: EstatusMigratorio;
  gradoOcurrencia: GradoOcurrencia;
  estatusDistribucion: EstatusDistribucion;
  // --- Conservación y referencias ---
  conservacion: Conservacion;
  /** Citas/referencias por especie (≥1). Sostiene la credibilidad del catálogo. */
  fuentes: string[];
  // --- Medios ---
  /** ≥1 foto; la primera es la portada. */
  fotos: Foto[];
  audios?: Audio[];
  // --- Opcionales ---
  /** Código compacto de guía de campo (p. ej. `R-PC-SR-N`); derivable. */
  simbologia?: string;
  medidas?: Medidas;
  /** Etiquetas de microhábitat (vocabulario sugerido en content/README.md). */
  habitat?: string[];
  temporada?: Temporada;
  // --- Cuerpo ---
  /** Markdown con las secciones `##` convenidas (ver SeccionFicha). */
  cuerpo: string;
}

/** Grupos válidos del catálogo (las carpetas con prefijo `_` se excluyen). */
const GRUPOS: Grupo[] = ["aves", "anfibios-reptiles"];

/** Núcleo estricto del esquema (#9): si falta algo de esto, el build falla. */
function camposNucleoFaltantes(
  data: Record<string, unknown>,
  cuerpo: string,
): string[] {
  const faltan: string[] = [];
  const req = (cond: boolean, campo: string) => {
    if (!cond) faltan.push(campo);
  };
  const str = (v: unknown) => typeof v === "string" && v.trim().length > 0;

  req(str(data.nombreComun), "nombreComun");
  req(str(data.nombreCientifico), "nombreCientifico");
  req(str(data.categoria), "categoria");
  req(str(data.orden), "orden");
  req(str(data.familia), "familia");
  req(str(data.estatusMigratorio), "estatusMigratorio");
  req(str(data.gradoOcurrencia), "gradoOcurrencia");
  req(str(data.estatusDistribucion), "estatusDistribucion");
  req(
    typeof data.conservacion === "object" &&
      data.conservacion !== null &&
      str((data.conservacion as Record<string, unknown>).nom059),
    "conservacion.nom059",
  );
  req(Array.isArray(data.fuentes) && data.fuentes.length >= 1, "fuentes");
  req(Array.isArray(data.fotos) && data.fotos.length >= 1, "fotos");
  req(/^##\s+Descripci[oó]n\s*$/im.test(cuerpo), "## Descripción");

  return faltan;
}

/** Lee y valida todas las fichas de FAUNA_DIR. Lanza si una ficha tiene el
    núcleo incompleto (build falla). Los campos opcionales/⊙ ausentes se toleran. */
export async function getAllFichas(): Promise<FichaEspecie[]> {
  const fichas: FichaEspecie[] = [];

  for (const grupo of GRUPOS) {
    const grupoDir = path.join(FAUNA_DIR, grupo);
    let entradas;
    try {
      entradas = await readdir(grupoDir, { withFileTypes: true });
    } catch {
      continue; // el grupo aún no existe (p. ej. anfibios-reptiles en Fase 1)
    }

    for (const entrada of entradas) {
      if (!entrada.isDirectory() || entrada.name.startsWith("_")) continue;
      const slugCarpeta = entrada.name;
      const fichaPath = path.join(grupoDir, slugCarpeta, "index.md");

      let raw: string;
      try {
        raw = await readFile(fichaPath, "utf8");
      } catch {
        continue; // carpeta sin index.md: se ignora
      }

      const { data, content } = matter(raw);
      const cuerpo = content.trim();

      const faltan = camposNucleoFaltantes(data, cuerpo);
      if (faltan.length > 0) {
        throw new Error(
          `Ficha inválida ${grupo}/${slugCarpeta}: faltan campos del núcleo: ${faltan.join(", ")}`,
        );
      }

      fichas.push({
        slug: typeof data.slug === "string" ? data.slug : slugCarpeta,
        grupo,
        categoria: data.categoria,
        nombreComun: data.nombreComun,
        nombreCientifico: data.nombreCientifico,
        orden: data.orden,
        familia: data.familia,
        genero: data.genero ?? "",
        estatusMigratorio: data.estatusMigratorio,
        gradoOcurrencia: data.gradoOcurrencia,
        estatusDistribucion: data.estatusDistribucion,
        conservacion: data.conservacion,
        fuentes: data.fuentes,
        fotos: data.fotos,
        audios: data.audios,
        simbologia: data.simbologia,
        medidas: data.medidas,
        habitat: data.habitat,
        temporada: data.temporada,
        cuerpo,
      });
    }
  }

  fichas.sort((a, b) => a.nombreComun.localeCompare(b.nombreComun, "es"));
  return fichas;
}
