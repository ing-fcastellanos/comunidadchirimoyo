/* content.ts — loader SERVER-ONLY de las fichas de fauna. Lee y valida
   content/fauna/<grupo>/<slug>/index.md en build. Importa node:fs/path, así que
   NO debe importarse desde Client Components: para tipos y `fotoUrl` en cliente
   usa lib/fauna-schema.ts (se re-exporta abajo para back-compat). */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { FichaEspecie, Grupo } from "./fauna-schema";
import { validarFicha } from "./fauna-validate";

export * from "./fauna-schema";

/** Raíz del contenido (content/). Por defecto relativo a la raíz del monorepo;
    override con la variable de entorno CONTENT_DIR. */
export const CONTENT_ROOT =
  process.env.CONTENT_DIR ?? path.resolve(process.cwd(), "../../content");

export const FAUNA_DIR = path.join(CONTENT_ROOT, "fauna");

/** Grupos válidos del catálogo, un grupo = un path (ADR-0024). El loader tolera
    los grupos cuya carpeta aún no exista; las carpetas con prefijo `_` se excluyen.
    Insectos/mamíferos se sumarán como nuevos valores cuando lleguen. */
const GRUPOS: Grupo[] = ["aves", "anfibios", "reptiles"];

/** Lee y valida todas las fichas de FAUNA_DIR. La lógica de validación vive en
    lib/fauna-validate.ts (fuente única, compartida con scripts/validar-fichas.mts);
    aquí solo filtramos los problemas de severidad "error" y lanzamos (el build
    falla). Los warnings y los campos opcionales ausentes se toleran. */
export async function getAllFichas(): Promise<FichaEspecie[]> {
  const fichas: FichaEspecie[] = [];
  const slugsVistos = new Set<string>();

  for (const grupo of GRUPOS) {
    const grupoDir = path.join(FAUNA_DIR, grupo);
    let entradas;
    try {
      entradas = await readdir(grupoDir, { withFileTypes: true });
    } catch {
      continue; // el grupo aún no existe en disco (p. ej. anfibios/reptiles hasta #88)
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

      const errores = validarFicha(data, cuerpo, { slugCarpeta, grupo, slugsVistos })
        .filter((p) => p.severidad === "error");
      if (errores.length > 0) {
        throw new Error(
          `Ficha inválida ${grupo}/${slugCarpeta}: ${errores.map((p) => `${p.campo} (${p.mensaje})`).join(", ")}`,
        );
      }
      slugsVistos.add(typeof data.slug === "string" && data.slug.trim() ? data.slug : slugCarpeta);

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
        genero: data.genero,
        estatusMigratorio: data.estatusMigratorio,
        gradoOcurrencia: data.gradoOcurrencia,
        estatusDistribucion: data.estatusDistribucion,
        conservacion: data.conservacion,
        fuentes: data.fuentes,
        fotos: data.fotos,
        audios: data.audios,
        distribucion: data.distribucion,
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
