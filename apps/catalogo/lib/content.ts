/* content.ts — acceso al contenido de fauna desde la raíz del repo, en build.
   STUB tipado (firma + tipos del esquema de #9). El parseo real va en #10/#11.
   Solo se usa en build (Server Components / generateStaticParams). */
import path from "node:path";

/** Raíz del contenido (content/). Por defecto relativo a la raíz del monorepo;
    override con la variable de entorno CONTENT_DIR. */
export const CONTENT_ROOT =
  process.env.CONTENT_DIR ?? path.resolve(process.cwd(), "../../content");

export const FAUNA_DIR = path.join(CONTENT_ROOT, "fauna");

/* ---- Tipos del esquema de ficha (alineados con #9) ---- */
export type Grupo = "aves" | "anfibios-reptiles";
export type EstatusMigratorio =
  | "residente"
  | "migratoria-invierno"
  | "migratoria-verano"
  | "transitoria";
export type GradoOcurrencia = "comun" | "poco-comun" | "rara";
export type EstatusDistribucion = "nativa" | "introducida";
export type Nom059 = "pr" | "a" | "p" | "e" | "ninguno";

export interface Conservacion {
  nom059: Nom059;
  iucn?: string;
  notas?: string;
}

export interface FichaEspecie {
  slug: string;
  grupo: Grupo;
  nombreComun: string;
  nombreCientifico: string;
  categoria: string;
  orden: string;
  familia: string;
  estatusMigratorio: EstatusMigratorio;
  gradoOcurrencia: GradoOcurrencia;
  estatusDistribucion: EstatusDistribucion;
  conservacion: Conservacion;
  descripcion: string;
  // Campos opcionales/⊙ (medidas, dieta, reproducción, observación,
  // distribución, fotos, etc.) se completan al definir el formato en #9.
}

/** STUB: devolverá todas las fichas leídas de FAUNA_DIR.
    Implementación real en #10 (migrar datos) / #11 (listado). */
export async function getAllFichas(): Promise<FichaEspecie[]> {
  // TODO(#10/#11): leer y parsear FAUNA_DIR según el formato definido en #9.
  return [];
}
