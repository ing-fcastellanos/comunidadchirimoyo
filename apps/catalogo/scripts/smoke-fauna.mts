/* =====================================================================
   smoke-fauna.mts — smoke test end-to-end del catálogo (#95, cierre Fase 2).
   Afirma sobre el `out/` YA CONSTRUIDO (no levanta servidor ni navegador):
     1. Rutas marco + un detalle por grupo existen y no están vacías.
     2. Enlaces internos /<grupo>/<slug> resuelven a archivos servibles.
     3. PDFs presentes e íntegros (%PDF).
     4. Ningún .html/.js de out/ referencia un API (catálogo estático,
        ADR-0005/0006).
     5. Vanity aves.chirimoyo.org → 301 fauna.chirimoyo.org/aves
        (red, OPT-IN: desactivado por defecto → SKIP; con SMOKE_VANITY=1 se
        verifica estrictamente, una vez configurado el 301).
   Termina con código ≠ 0 si hay ≥1 chequeo `fail`. Corre con `npm run smoke`
   y se engancha en `deploy_prod` tras el build. Ver smoke-catalogo-fauna.

   Variables de entorno:
     OUT_DIR             raíz del export (default: ../out).
     SMOKE_VANITY        "1" activa el check de red del vanity (default: SKIP).
     VANITY_URL          URL a probar (default https://aves.chirimoyo.org/).
     SMOKE_API_PATTERN   regex (source) para detectar fugas de API. Default:
                         host de backend (Cloud Run / api.chirimoyo) o los
                         endpoints reales /api/contacto|/api/inscripci. NO el
                         genérico "/api/" (lo trae el runtime de Next).
   ===================================================================== */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");                       // apps/catalogo
const OUT = process.env.OUT_DIR ?? path.resolve(APP, "out");

const GRUPOS = ["aves", "anfibios", "reptiles"] as const;
const VANITY_URL = process.env.VANITY_URL ?? "https://aves.chirimoyo.org/";
const VANITY_DEST = "https://fauna.chirimoyo.org/aves";
const API_PATTERN = new RegExp(
  process.env.SMOKE_API_PATTERN ?? "\\.a\\.run\\.app|/api/(contacto|inscripci)|api\\.chirimoyo",
);

/* ---------- reporte ---------- */
type Estado = "pass" | "skip" | "fail";
interface Resultado { nombre: string; estado: Estado; detalle?: string }
const resultados: Resultado[] = [];
const add = (nombre: string, estado: Estado, detalle?: string) =>
  resultados.push({ nombre, estado, detalle });
const ICON: Record<Estado, string> = { pass: "✓", skip: "⚠", fail: "✖" };

/* ---------- helpers ---------- */
async function existe(p: string): Promise<boolean> {
  try { await stat(p); return true; } catch { return false; }
}
async function noVacio(p: string): Promise<boolean> {
  try { return (await stat(p)).size > 0; } catch { return false; }
}

/** Resuelve una ruta servible (cleanUrls) a un archivo en out/, o null. */
async function resolverRuta(ruta: string): Promise<string | null> {
  const limpio = ruta.split("#")[0].split("?")[0];
  if (limpio === "/" || limpio === "") {
    const idx = path.join(OUT, "index.html");
    return (await existe(idx)) ? idx : null;
  }
  const rel = limpio.replace(/^\/+/, "");
  const candidatos = [
    path.join(OUT, `${rel}.html`),
    path.join(OUT, rel, "index.html"),
    path.join(OUT, rel),
  ];
  for (const c of candidatos) if (await existe(c)) return c;
  return null;
}

/** Lista recursiva de archivos bajo dir con alguna de las extensiones dadas. */
async function listar(dir: string, exts: string[]): Promise<string[]> {
  const out: string[] = [];
  async function rec(d: string) {
    let entradas;
    try { entradas = await readdir(d, { withFileTypes: true }); } catch { return; }
    for (const e of entradas) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) await rec(full);
      else if (exts.some((x) => e.name.endsWith(x))) out.push(full);
    }
  }
  await rec(dir);
  return out;
}

/* ---------- chequeos ---------- */

/** Guard: out/ construido. Devuelve false si falta (corta el resto). */
async function guardBuild(): Promise<boolean> {
  if (await existe(path.join(OUT, "index.html"))) return true;
  add("build presente (out/index.html)", "fail", `no existe ${OUT}/index.html — corre \`npm run build\` primero`);
  return false;
}

/** Primer detalle servible de un grupo (out/<grupo>/<slug>.html, sin buscador). */
async function primerDetalle(grupo: string): Promise<string | null> {
  let entradas;
  try { entradas = await readdir(path.join(OUT, grupo), { withFileTypes: true }); }
  catch { return null; }
  const html = entradas
    .filter((e) => e.isFile() && e.name.endsWith(".html") && e.name !== "buscador.html")
    .map((e) => e.name)
    .sort();
  return html.length ? `/${grupo}/${html[0].replace(/\.html$/, "")}` : null;
}

async function chequeoRutasMarco(): Promise<string[]> {
  const marco = ["/", "/aves", "/anfibios", "/reptiles", "/busqueda", "/aves/buscador"];
  const paginas: string[] = [];
  for (const r of marco) {
    const f = await resolverRuta(r);
    if (f && (await noVacio(f))) { add(`ruta ${r}`, "pass"); paginas.push(f); }
    else add(`ruta ${r}`, "fail", f ? "archivo vacío" : "no resuelve a archivo en out/");
  }
  // un detalle por grupo (derivado)
  for (const g of GRUPOS) {
    const det = await primerDetalle(g);
    if (!det) { add(`detalle de ${g}`, "fail", "ningún detalle en out/" + g); continue; }
    const f = await resolverRuta(det);
    if (f && (await noVacio(f))) { add(`detalle ${det}`, "pass"); paginas.push(f); }
    else add(`detalle ${det}`, "fail", "no resuelve / vacío");
  }
  return paginas;
}

async function chequeoEnlacesInternos(paginas: string[]) {
  const detalleRe = /^\/(aves|anfibios|reptiles)\/[a-z0-9-]+$/;
  const enlaces = new Set<string>();
  for (const p of paginas) {
    const html = await readFile(p, "utf8");
    for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
      const href = m[1].split("#")[0].split("?")[0];
      if (detalleRe.test(href)) enlaces.add(href);
    }
  }
  const rotos: string[] = [];
  for (const href of enlaces) if (!(await resolverRuta(href))) rotos.push(href);
  if (enlaces.size === 0) add("enlaces internos /<grupo>/<slug>", "fail", "no se halló ningún enlace de detalle (¿HTML inesperado?)");
  else if (rotos.length) add("enlaces internos /<grupo>/<slug>", "fail", `${rotos.length} roto(s): ${rotos.slice(0, 5).join(", ")}`);
  else add(`enlaces internos /<grupo>/<slug> (${enlaces.size})`, "pass");
}

async function chequeoPdfs() {
  const pdfs = ["catalogo-aves-chirimoyo.pdf", "catalogo-herpetofauna-chirimoyo.pdf"];
  for (const nombre of pdfs) {
    const p = path.join(OUT, nombre);
    if (!(await existe(p))) { add(`pdf ${nombre}`, "fail", "no existe en out/"); continue; }
    const size = (await stat(p)).size;
    const firma = (await readFile(p)).subarray(0, 5).toString("latin1");
    if (size > 0 && firma.startsWith("%PDF")) add(`pdf ${nombre}`, "pass", `${(size / 1024).toFixed(0)} KB`);
    else add(`pdf ${nombre}`, "fail", size === 0 ? "tamaño 0" : `firma inválida (${firma})`);
  }
}

async function chequeoSinApi() {
  const archivos = await listar(OUT, [".html", ".js"]);
  const fugas: string[] = [];
  for (const f of archivos) {
    if (API_PATTERN.test(await readFile(f, "utf8"))) fugas.push(path.relative(OUT, f));
  }
  if (fugas.length) add("sin llamadas al API", "fail", `${fugas.length} archivo(s): ${fugas.slice(0, 5).join(", ")}`);
  else add(`sin llamadas al API (${archivos.length} archivos)`, "pass");
}

async function chequeoVanity() {
  // Opt-in: por defecto NO se toca la red (el host puede resolver a 200 antes
  // de configurar el redirect). Se activa con SMOKE_VANITY=1 una vez el 301
  // exista, y ahí sí verifica estrictamente.
  if (process.env.SMOKE_VANITY !== "1") {
    add("vanity 301 aves.* → fauna/aves", "skip", "no verificado (export SMOKE_VANITY=1 cuando el 301 esté configurado)");
    return;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  let res: Response;
  try {
    res = await fetch(VANITY_URL, { redirect: "manual", signal: ctrl.signal });
  } catch {
    add("vanity 301 aves.* → fauna/aves", "fail", `${VANITY_URL} no resuelve/timeout (SMOKE_VANITY=1 exige el 301 configurado)`);
    return;
  } finally {
    clearTimeout(timer);
  }
  const loc = res.headers.get("location") ?? "";
  if (res.status === 301 && loc.startsWith(VANITY_DEST)) {
    add("vanity 301 aves.* → fauna/aves", "pass", `301 → ${loc}`);
  } else {
    add("vanity 301 aves.* → fauna/aves", "fail", `esperaba 301 → ${VANITY_DEST}, recibí ${res.status}${loc ? ` → ${loc}` : ""}`);
  }
}

/* ---------- main ---------- */
async function main() {
  console.log(`smoke-fauna · out/ = ${OUT}\n`);

  if (await guardBuild()) {
    const paginas = await chequeoRutasMarco();
    await chequeoEnlacesInternos(paginas);
    await chequeoPdfs();
    await chequeoSinApi();
  }
  await chequeoVanity();

  console.log("");
  for (const r of resultados) {
    console.log(`  ${ICON[r.estado]} ${r.nombre}${r.detalle ? ` — ${r.detalle}` : ""}`);
  }
  const pass = resultados.filter((r) => r.estado === "pass").length;
  const skip = resultados.filter((r) => r.estado === "skip").length;
  const fail = resultados.filter((r) => r.estado === "fail").length;
  console.log(`\n${fail === 0 ? "✓" : "✖"} smoke: ${pass} pass · ${skip} skip · ${fail} fail`);

  // exitCode (no process.exit) para que Node drene handles limpiamente.
  if (fail > 0) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
