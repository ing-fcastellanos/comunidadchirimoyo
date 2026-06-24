/* =====================================================================
   validar-fichas.mts — valida TODO content/fauda/ contra el esquema (#91).
   Recorre aves + anfibios + reptiles, llama validarFicha() (la misma lógica
   que el loader, lib/fauna-validate.ts) acumulando los problemas POR FICHA
   y emite un reporte. Termina con código ≠ 0 si hay al menos un `error`;
   los `warning` informan sin romper. Se corre en CI (ci-frontend.yml) y en
   local con `npm run validate:fichas`. Ver esquema-ficha-fauna.

   Variables de entorno:
     CONTENT_DIR        raíz de content/ (default: ../../content).
     PHOTO_SELECTIONS   selección curada (default: print/photo-selections.json).
   ===================================================================== */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

import { validarFicha, type Problema } from "../lib/fauna-validate.ts";
import type { Grupo } from "../lib/fauna-schema.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");                       // apps/catalogo

const CONTENT_ROOT = process.env.CONTENT_DIR ?? path.resolve(APP, "..", "..", "content");
const FAUNA_DIR = path.join(CONTENT_ROOT, "fauna");
const SELECTIONS = process.env.PHOTO_SELECTIONS ?? path.join(APP, "print", "photo-selections.json");

const GRUPOS: Grupo[] = ["aves", "anfibios", "reptiles"];

/** Selección curada por slug (solo necesitamos `archivo` para el warning). */
async function cargarSelecciones(): Promise<Record<string, { archivo: string }>> {
  try {
    return JSON.parse(await readFile(SELECTIONS, "utf8"));
  } catch {
    return {};
  }
}

interface ReporteFicha {
  grupo: Grupo;
  slugCarpeta: string;
  problemas: Problema[];
}

async function main() {
  const selecciones = await cargarSelecciones();
  const slugsVistos = new Set<string>();
  const reportes: ReporteFicha[] = [];
  let totalFichas = 0;

  for (const grupo of GRUPOS) {
    const grupoDir = path.join(FAUNA_DIR, grupo);
    let entradas;
    try {
      entradas = await readdir(grupoDir, { withFileTypes: true });
    } catch {
      continue; // el grupo aún no existe en disco
    }

    for (const entrada of entradas) {
      if (!entrada.isDirectory() || entrada.name.startsWith("_")) continue;
      const slugCarpeta = entrada.name;
      const fichaPath = path.join(grupoDir, slugCarpeta, "index.md");

      let raw: string;
      try {
        raw = await readFile(fichaPath, "utf8");
      } catch {
        continue; // carpeta sin index.md
      }

      totalFichas++;
      const { data, content } = matter(raw);
      const cuerpo = content.trim();
      const slug = typeof data.slug === "string" && data.slug.trim() ? data.slug : slugCarpeta;

      const problemas = validarFicha(data, cuerpo, {
        slugCarpeta,
        grupo,
        slugsVistos,
        seleccionCurada: selecciones[slug]?.archivo,
      });
      slugsVistos.add(slug);

      if (problemas.length > 0) reportes.push({ grupo, slugCarpeta, problemas });
    }
  }

  // --- Reporte ---
  let nErrores = 0;
  let nWarnings = 0;
  for (const r of reportes) {
    const errs = r.problemas.filter((p) => p.severidad === "error");
    const warns = r.problemas.filter((p) => p.severidad === "warning");
    nErrores += errs.length;
    nWarnings += warns.length;
    const icono = errs.length > 0 ? "✖" : "⚠";
    console.log(`\n${icono} ${r.grupo}/${r.slugCarpeta}`);
    for (const p of r.problemas) {
      const tag = p.severidad === "error" ? "ERROR  " : "WARNING";
      console.log(`    ${tag} ${p.campo}: ${p.mensaje}`);
    }
  }

  console.log(
    `\n${nErrores === 0 ? "✓" : "✖"} ${totalFichas} fichas validadas — ` +
      `${nErrores} error(es), ${nWarnings} warning(s).`,
  );

  if (nErrores > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
