/* fauna-schema.ts — tipos del esquema de ficha (#9) + composición de URLs de
   imagen. Módulo PURO (sin node:fs/path): seguro para Client Components.
   El loader server-only vive en content.ts; la presentación de enums en
   dictionary.ts. */

/** Base pública del bucket GCS donde viven las imágenes de fauna. Las fichas
    guardan solo el nombre de archivo; la URL se compone por prefijo (`web` para
    detalle, `thumb` para cards). Ver ADR-0016. Override con
    `NEXT_PUBLIC_FAUNA_CDN_BASE` (p. ej. un dominio/CDN propio en el futuro). */
export const FAUNA_CDN_BASE =
  process.env.NEXT_PUBLIC_FAUNA_CDN_BASE ??
  "https://storage.googleapis.com/catalogo-aves-chirimoyo";

export type VarianteImagen = "web" | "thumb";

/** Compone la URL pública de una foto: `${BASE}/<variante>/<slug>/<archivo>`. */
export function fotoUrl(slug: string, archivo: string, variante: VarianteImagen): string {
  return `${FAUNA_CDN_BASE}/${variante}/${slug}/${archivo}`;
}

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

/* ---- Campos de búsqueda visual (vocabularios cerrados, opcionales) ----
   Alimentan los filtros del buscador para principiantes. Las etiquetas/iconos
   de cada valor viven en lib/dictionary.ts. */
export type Forma = "pato" | "garza" | "gallineta" | "buceador" | "playera" | "rapaz" | "pajaro";
export type Tamano = "muy-chica" | "chica" | "mediana" | "grande" | "muy-grande";
export type Color =
  | "blanco"
  | "negro"
  | "cafe"
  | "gris"
  | "azul"
  | "verde"
  | "amarillo"
  | "rojo"
  | "naranja"
  | "iridiscente";
export type Donde = "nadando" | "orilla" | "volando" | "arbol" | "suelo" | "poste";

/** Categoría de riesgo NOM-059-SEMARNAT. */
export type Nom059 = "pr" | "a" | "p" | "e" | "ninguno";

/** Secciones `##` convenidas del cuerpo Markdown (en este orden, las que existan). */
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
  tamanoCm?: [number, number];
  pesoG?: [number, number];
  notas?: string;
}

export interface Temporada {
  meses?: number[];
  notas?: string;
}

export interface Foto {
  /** Nombre del archivo; la URL se compone con `fotoUrl(slug, archivo, variante)`. */
  archivo: string;
  credito: string;
  alt: string;
  licencia?: string;
  /** Enlace a la observación/foto original (atribución TASL de CC BY/BY-SA). */
  creditoUrl?: string;
  /** Enlace al texto legal de la licencia. */
  licenciaUrl?: string;
}

export interface Audio {
  archivo: string;
  credito: string;
  descripcion?: string;
  licencia?: string;
}

export interface FichaEspecie {
  // --- Identidad ---
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
  fuentes: string[];
  // --- Medios ---
  fotos: Foto[];
  audios?: Audio[];
  // --- Opcionales descriptivos ---
  simbologia?: string;
  medidas?: Medidas;
  habitat?: string[];
  temporada?: Temporada;
  // --- Búsqueda visual (opcionales; alimentan los filtros del buscador) ---
  forma?: Forma;
  tamano?: Tamano;
  colores?: Color[];
  donde?: Donde;
  featured?: boolean;
  // --- Cuerpo ---
  /** Markdown con las secciones `##` convenidas (ver SeccionFicha). */
  cuerpo: string;
}
