/* =====================================================================
   aplicar-foto-principal.mjs — alinea la portada del sitio con la del PDF.

   La curaduría del PDF vive en apps/catalogo/print/photo-selections.json
   ({ slug: { archivo, crop } }). El sitio muestra fotos[0] de cada ficha.
   Este script deja la foto curada como PRIMERA entrada de `fotos[]` en el
   frontmatter de content/fauna/aves/<slug>/index.md, casando por STEM
   (nombre sin extensión, en minúsculas) — la misma regla que el build-pdf.

   - Reordena SOLO el bloque `fotos:`, preservando el texto exacto de cada
     entrada (cero re-serialización del YAML → diff mínimo).
   - Idempotente: si la curada ya es la primera, no escribe.
   - Solo selección (NO aplica el crop). Ver change `foto-principal-curada`.

   Uso:
     node scripts/aplicar-foto-principal.mjs          # aplica y reporta
     node scripts/aplicar-foto-principal.mjs --dry     # solo reporta
   ===================================================================== */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const SELECTIONS = path.join(ROOT, "apps", "catalogo", "print", "photo-selections.json");
const AVES_DIR = path.join(ROOT, "content", "fauna", "aves");
const DRY = process.argv.includes("--dry");

/** stem case-insensitive: "DSCN3085.JPG" -> "dscn3085" (igual que build-pdf). */
const stem = (archivo) => path.parse(archivo).name.toLowerCase();

/**
 * Reordena el bloque `fotos:` del frontmatter para dejar al frente la entrada
 * cuyo `archivo` casa por stem con `targetStem`. Devuelve { texto, estado }.
 * Operación puramente textual: no toca otros campos ni el cuerpo.
 */
function reorderFotos(raw, targetStem) {
  const lines = raw.split("\n");

  // 1) localizar el primer bloque frontmatter (--- ... ---)
  if (lines[0].trim() !== "---") return { texto: raw, estado: "sin-frontmatter" };
  let fmEnd = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") { fmEnd = i; break; }
  }
  if (fmEnd === -1) return { texto: raw, estado: "sin-frontmatter" };

  // 2) localizar la línea `fotos:` dentro del frontmatter (sin indentación)
  let fotosLine = -1;
  for (let i = 1; i < fmEnd; i++) {
    if (/^fotos:\s*$/.test(lines[i])) { fotosLine = i; break; }
  }
  if (fotosLine === -1) return { texto: raw, estado: "sin-fotos" };

  // 3) capturar el rango del bloque: desde la primera línea de lista hasta
  //    el siguiente top-level key (sin indentación) o el cierre del frontmatter.
  let blockStart = fotosLine + 1;
  let blockEnd = blockStart; // exclusivo
  for (let i = blockStart; i < fmEnd; i++) {
    const l = lines[i];
    if (l.trim() === "") { blockEnd = i + 1; continue; }   // línea en blanco interna
    if (/^\s/.test(l)) { blockEnd = i + 1; }               // indentada → parte del bloque
    else break;                                            // top-level key → fin
  }

  // 4) partir el bloque en entradas: cada una arranca en `  - `
  const block = lines.slice(blockStart, blockEnd);
  const entries = [];
  for (const l of block) {
    if (/^\s*-\s/.test(l)) entries.push([l]);
    else if (entries.length) entries[entries.length - 1].push(l);
    // (líneas antes de la 1ª entrada — no debería haber — se ignoran)
  }
  if (entries.length === 0) return { texto: raw, estado: "sin-fotos" };

  // 5) encontrar la entrada cuyo archivo casa por stem
  const archivoDe = (entry) => {
    for (const l of entry) {
      const m = l.match(/archivo:\s*["']?([^"'\s]+)["']?/);
      if (m) return m[1];
    }
    return null;
  };
  const idx = entries.findIndex((e) => {
    const a = archivoDe(e);
    return a && stem(a) === targetStem;
  });
  if (idx === -1) return { texto: raw, estado: "sin-coincidencia" };
  if (idx === 0) return { texto: raw, estado: "ya-correcta" };

  // 6) mover la entrada al frente, preservando el texto exacto de cada una
  const [chosen] = entries.splice(idx, 1);
  entries.unshift(chosen);
  const nuevoBloque = entries.flat();
  const nuevasLineas = [
    ...lines.slice(0, blockStart),
    ...nuevoBloque,
    ...lines.slice(blockEnd),
  ];
  return { texto: nuevasLineas.join("\n"), estado: "reordenada" };
}

async function main() {
  const sels = JSON.parse(await readFile(SELECTIONS, "utf8"));
  const slugs = Object.keys(sels);
  const rep = { reordenada: [], "ya-correcta": [], "sin-coincidencia": [], "sin-fotos": [], "sin-frontmatter": [], "sin-ficha": [] };

  for (const slug of slugs) {
    const archivo = sels[slug]?.archivo;
    if (!archivo) { rep["sin-coincidencia"].push(`${slug} (selección sin archivo)`); continue; }
    const file = path.join(AVES_DIR, slug, "index.md");
    let raw;
    try { raw = await readFile(file, "utf8"); }
    catch { rep["sin-ficha"].push(slug); continue; }

    const { texto, estado } = reorderFotos(raw, stem(archivo));
    rep[estado].push(slug);
    if (estado === "reordenada" && !DRY) await writeFile(file, texto, "utf8");
  }

  // fichas sin selección (cobertura): aves con ficha pero sin entrada en el JSON
  const todas = (await import("node:fs/promises")).readdir(AVES_DIR);
  let sinSeleccion = [];
  try {
    const dirs = await todas;
    sinSeleccion = dirs.filter((d) => !slugs.includes(d));
  } catch { /* noop */ }

  const line = (k, arr) => `  ${k.padEnd(18)} ${arr.length}${arr.length ? "  " + arr.join(", ") : ""}`;
  console.log(`\n→ aplicar-foto-principal ${DRY ? "(dry-run)" : ""}`);
  console.log(`  selecciones: ${slugs.length}\n`);
  console.log(line("reordenada", rep.reordenada));
  console.log(line("ya-correcta", rep["ya-correcta"]));
  console.log(line("sin-coincidencia", rep["sin-coincidencia"]));
  console.log(line("sin-fotos", rep["sin-fotos"]));
  console.log(line("sin-frontmatter", rep["sin-frontmatter"]));
  console.log(line("sin-ficha", rep["sin-ficha"]));
  console.log(line("sin-selección (cobertura)", sinSeleccion));
  const warn = rep["sin-coincidencia"].length + rep["sin-fotos"].length + rep["sin-frontmatter"].length + rep["sin-ficha"].length;
  console.log(`\n${DRY ? "[dry] " : ""}${rep.reordenada.length} reordenada(s)${warn ? `, ${warn} a revisar` : ""}.\n`);
}

main().catch((e) => { console.error("✗", e); process.exit(1); });
