/* proteccion.ts — loader del contenido curado de la página /proteccion (#78).
   Lee content/fauna/proteccion.json en build (mismo CONTENT_ROOT que content.ts).
   Contenido curado y pequeño: sin validación pesada, mismo criterio que
   colaboradores.ts. Los arrays `especies` de cada categoría NOM-059 y el
   ejemplo de `cites` NO se derivan de las fichas: se mantienen curados a mano
   junto con content/fauna/<grupo>/<slug>/index.md cuando cambie su estatus. */
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { IconName } from "@/components/ui/Icon";
import { FAUNA_DIR } from "./content";

export type CategoriaNom059 = "pr" | "a" | "p" | "e";

export interface Nom059Categoria {
  cat: CategoriaNom059;
  label: string;
  /** Texto divulgativo de qué implica la categoría. */
  resumen: string;
  /** Nombres comunes de especies del humedal en esta categoría (vacío si ninguna). */
  especies: string[];
}

export interface IucnCategoria {
  code: string;
  label: string;
}

export interface CitesEjemplo {
  especie: string;
  apendice: string;
  /** Motivo divulgativo, respaldado por el texto ya existente en la ficha de la especie. */
  nota: string;
}

export interface FuenteEnlace {
  nombre: string;
  fuente: string;
  enlace: string;
}

export interface FuenteGrupo {
  rol: string;
  icono?: IconName;
  enlaces: FuenteEnlace[];
}

export interface CifrasProteccion {
  totalEspecies: number;
  aves: number;
  anfibiosReptiles: number;
  conEstatus: number;
}

export interface ProteccionData {
  cifras: CifrasProteccion;
  nom059: Nom059Categoria[];
  iucn: IucnCategoria[];
  cites: CitesEjemplo;
  fuentes: FuenteGrupo[];
}

const PROTECCION_JSON = path.join(FAUNA_DIR, "proteccion.json");

/** Lee el contenido curado de la página de protección. */
export async function getProteccion(): Promise<ProteccionData> {
  const raw = await readFile(PROTECCION_JSON, "utf8");
  return JSON.parse(raw) as ProteccionData;
}
