/* content.ts — loader SERVER-ONLY de las fichas de fauna. Lee y valida
   content/fauna/<grupo>/<slug>/index.md en build. Importa node:fs/path, así que
   NO debe importarse desde Client Components: para tipos y `fotoUrl` en cliente
   usa lib/fauna-schema.ts (se re-exporta abajo para back-compat). */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { FichaEspecie, Grupo } from "./fauna-schema";

export * from "./fauna-schema";

/** Raíz del contenido (content/). Por defecto relativo a la raíz del monorepo;
    override con la variable de entorno CONTENT_DIR. */
export const CONTENT_ROOT =
  process.env.CONTENT_DIR ?? path.resolve(process.cwd(), "../../content");

export const FAUNA_DIR = path.join(CONTENT_ROOT, "fauna");

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
        autoridad: data.autoridad,
        otrosNombres: data.otrosNombres,
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
        pullQuote: data.pullQuote,
        medidas: data.medidas,
        envergadura: data.envergadura,
        habitat: data.habitat,
        temporada: data.temporada,
        mejorHora: data.mejorHora,
        forma: data.forma,
        tamano: data.tamano,
        colores: data.colores,
        donde: data.donde,
        featured: data.featured,
        cuerpo,
      });
    }
  }

  fichas.sort((a, b) => a.nombreComun.localeCompare(b.nombreComun, "es"));
  return fichas;
}
