/* content.ts — acceso al contenido de fauna desde la raíz del repo, en build.
   STUB tipado (firma + tipos del esquema de #9). El parseo real va en #10/#11.
   Solo se usa en build (Server Components / generateStaticParams). */
import path from "node:path";

/** Raíz del contenido (content/). Por defecto relativo a la raíz del monorepo;
    override con la variable de entorno CONTENT_DIR. */
export const CONTENT_ROOT =
  process.env.CONTENT_DIR ?? path.resolve(process.cwd(), "../../content");

export const FAUNA_DIR = path.join(CONTENT_ROOT, "fauna");

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
  /** Ruta relativa a la carpeta de la ficha (p. ej. `foto-1.jpg`). */
  archivo: string;
  /** Autor o fuente de la foto. Obligatorio. */
  credito: string;
  /** Texto alternativo (accesibilidad; string traducible). Obligatorio. */
  alt: string;
  licencia?: string;
}

export interface Audio {
  /** Ruta relativa a la carpeta de la ficha (p. ej. `canto-1.mp3`). */
  archivo: string;
  credito: string;
  descripcion?: string;
  licencia?: string;
}

export interface FichaEspecie {
  // --- Identidad ---
  /** Derivado del nombre científico (binomio → kebab-case); override posible. */
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

/** STUB: devolverá todas las fichas leídas de FAUNA_DIR.
    Implementación real en #10 (migrar datos) / #11 (listado). */
export async function getAllFichas(): Promise<FichaEspecie[]> {
  // TODO(#10/#11): leer y parsear FAUNA_DIR según el formato definido en #9.
  return [];
}
