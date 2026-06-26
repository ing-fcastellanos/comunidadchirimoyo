/* colaboradores.ts — loader del contenido curado de colaboradores del catálogo
   (#77). Lee content/fauna/colaboradores.json en build (mismo CONTENT_ROOT que
   content.ts). Es contenido curado y pequeño: sin validación pesada. La página
   /colaboradores reconoce al equipo del proyecto (biólogos, fotografía,
   desarrollo); las atribuciones CC externas y los grabadores de xeno-canto NO
   son colaboradores y siguen acreditados por ficha. */
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { IconName } from "@/components/ui/Icon";
import { FAUNA_DIR } from "./content";

export interface Colaborador {
  nombre: string;
  /** Grado o contribución breve. */
  aporte: string;
  /** Perfil/redes, opcional. */
  enlace?: string;
  /** Reservado para una futura foto del colaborador (no usado por ahora). */
  foto?: string;
}

export interface GrupoColaboradores {
  rol: string;
  icono?: IconName;
  personas: Colaborador[];
}

const COLABORADORES_JSON = path.join(FAUNA_DIR, "colaboradores.json");

/** Lee los grupos de colaboradores curados (en su orden de presentación). */
export async function getColaboradores(): Promise<GrupoColaboradores[]> {
  const raw = await readFile(COLABORADORES_JSON, "utf8");
  const data = JSON.parse(raw) as { grupos?: GrupoColaboradores[] };
  return data.grupos ?? [];
}
