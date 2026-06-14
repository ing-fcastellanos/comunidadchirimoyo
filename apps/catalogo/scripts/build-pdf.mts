/* =====================================================================
   build-pdf.mts — genera el PDF único del catálogo de aves (issue #14).
   En BUILD, a partir de content/ y de la copia local de imágenes. Sin red
   (salvo el Chromium ya instalado), sin API. Ver design.md / ADR.

   Pasos:
     1. Lee las fichas con el data layer del catálogo (getAllFichas).
     2. Construye los view-models por página (incluye extractos de texto).
     3. Resuelve la foto principal desde el banco local (sharp → data-URI).
     4. Genera los QR reales (qrcode → data-URI).
     5. Hace el layout del índice (columnas/páginas) y calcula folios reales.
     6. Renderiza el documento (react-dom/server) y lo imprime con Playwright.

   Variables de entorno:
     FAUNA_BANCO_DIR   banco local de imágenes (default: copia conocida).
     SITE_AVES_BASE    base del sitio de aves (default https://aves.chirimoyo.org).
     PDF_OUT           ruta de salida (default public/catalogo-aves-chirimoyo.pdf).
   ===================================================================== */
import { readdir, readFile, writeFile, unlink, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import QRCode from "qrcode";
import { chromium } from "playwright";

import { getAllFichas } from "../lib/content.ts";
import type { FichaEspecie } from "../lib/fauna-schema.ts";
import {
  MIGRATORIO_LABEL, OCURRENCIA_LABEL, DISTRIBUCION_LABEL,
} from "../lib/dictionary.ts";
import { Document } from "../print/templates/Document.tsx";
import type {
  CatalogData, SpeciesVM, IndexItem, IndexPageVM, Medida, StatusChip,
} from "../print/templates/types.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");                       // apps/catalogo
const PRINT_DIR = path.join(APP, "print");

const BANCO_DIR = process.env.FAUNA_BANCO_DIR
  ?? "C:\\Users\\Frank\\Downloads\\Img guia aves\\Imagenes aves";
const AVES_BASE = (process.env.SITE_AVES_BASE ?? "https://aves.chirimoyo.org").replace(/\/$/, "");
const OUT = process.env.PDF_OUT ?? path.join(APP, "public", "catalogo-aves-chirimoyo.pdf");
const SELECTIONS = process.env.PHOTO_SELECTIONS ?? path.join(PRINT_DIR, "photo-selections.json");
const RESUMENES_CSV = process.env.RESUMENES_CSV
  ?? path.resolve(APP, "..", "..", "content", "fauna", "_origen", "aves-especies.csv");
const EDICION = "2026";

/** Selección/encuadre de foto por ave (generado con `npm run photo:tool`). */
type Crop = { x: number; y: number; w: number; h: number };
let SELS: Record<string, { archivo: string; crop?: Crop }> = {};

const warnings: string[] = [];
const warn = (m: string) => { warnings.push(m); console.warn("  ⚠ " + m); };

/* ---- presentación de gremios (orden, color del punto, tono del tag) ---- */
const GUILD_ORDER = ["Vadeadoras", "Nadadoras", "Playeras", "Voladoras", "Rapaces y Carroñeras", "Terrestres"];
const GUILD_DOT: Record<string, string> = {
  Vadeadoras: "#2f9d6a", Nadadoras: "#3f6f9e", Playeras: "#b08a2e",
  Voladoras: "#6a4d86", "Rapaces y Carroñeras": "#b5543a", Terrestres: "#5e6b22",
};
const GUILD_TONE: Record<string, { bg: string; fg: string }> = {
  Vadeadoras: { bg: "#cdeedd", fg: "#0c5a36" },
  Nadadoras: { bg: "#d8e6f0", fg: "#2c5a7a" },
  Playeras: { bg: "#ece2cf", fg: "#8a6d3b" },
  Voladoras: { bg: "#e6dcef", fg: "#6a4d86" },
  "Rapaces y Carroñeras": { bg: "#f6e1da", fg: "#8f3c25" },
  Terrestres: { bg: "#e3e9cf", fg: "#5e6b22" },
};
const guildRank = (c: string) => {
  const i = GUILD_ORDER.indexOf(c);
  return i === -1 ? GUILD_ORDER.length : i;
};

/* ---- estatus → chips ---- */
function statusChips(f: FichaEspecie): StatusChip[] {
  const migTone = f.estatusMigratorio === "residente" ? "teal"
    : f.estatusMigratorio === "transitoria" ? "terra" : "ochre";
  const ocuTone = f.gradoOcurrencia === "comun" ? "forest"
    : f.gradoOcurrencia === "rara" ? "terra" : "ochre";
  const disTone = f.estatusDistribucion === "nativa" ? "forest" : "terra";
  return [
    { tone: migTone, label: "Estatus", value: MIGRATORIO_LABEL[f.estatusMigratorio] },
    { tone: ocuTone, label: "Ocurrencia", value: OCURRENCIA_LABEL[f.gradoOcurrencia] },
    { tone: disTone, label: "Distribución", value: DISTRIBUCION_LABEL[f.estatusDistribucion] },
  ];
}

const IUCN_TONE: Record<string, string> = {
  LC: "forest", NT: "ochre", VU: "ochre", EN: "terra", CR: "terra", EW: "terra", EX: "ink",
};
const NOM_LABEL: Record<string, string> = { pr: "Pr", a: "A", p: "P", e: "E", ninguno: "—" };

/* ---- medidas ---- */
function medidas(f: FichaEspecie): Medida[] {
  const out: Medida[] = [];
  const rango = (r?: [number, number]) => r ? `${r[0]}–${r[1]}` : null;
  const t = rango(f.medidas?.tamanoCm);
  if (t) out.push({ k: "Tamaño", v: t, u: "cm" });
  const p = rango(f.medidas?.pesoG);
  if (p) out.push({ k: "Peso", v: p, u: "g" });
  if (f.envergadura) {
    const m = f.envergadura.match(/^([\d–\-.\s]+)\s*(\S+)?$/);
    out.push(m ? { k: "Envergadura", v: m[1].trim(), u: m[2] ?? "" } : { k: "Envergadura", v: f.envergadura, u: "" });
  }
  return out;
}

/* ---- extractos del cuerpo Markdown: heading `##` → texto plano ---- */
function sections(cuerpo: string): Record<string, string> {
  const map: Record<string, string> = {};
  const re = /^##\s+(.+?)\s*$/gm;
  const heads: { title: string; start: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(cuerpo))) heads.push({ title: m[1], start: m.index + m[0].length });
  for (let i = 0; i < heads.length; i++) {
    const end = i + 1 < heads.length ? cuerpo.lastIndexOf("\n##", heads[i + 1].start) : cuerpo.length;
    map[norm(heads[i].title)] = cuerpo.slice(heads[i].start, end).trim().replace(/\s+/g, " ");
  }
  return map;
}
const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!]/g, "").trim();

function clip(text: string | undefined, max = 340): string | undefined {
  if (!text) return undefined;
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return (lastStop > max * 0.5 ? cut.slice(0, lastStop + 1) : cut.replace(/\s+\S*$/, "")) + " […]";
}

/* ---- resúmenes curados (≤350c) desde el CSV de origen ----
   Columnas: resumen_descripcion, resumen_como_identificarla,
   resumen_sabias_que, resumen_donde_cuando. Casan por nombre científico.
   Tienen prioridad sobre el recorte automático del cuerpo Markdown. */
type Resumen = { desc?: string; id?: string; sabias?: string; donde?: string };
const RES: Record<string, Resumen> = {};

function parseCsv(s: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

async function loadResumenes() {
  let text: string;
  try { text = await readFile(RESUMENES_CSV, "utf8"); }
  catch { console.log("  Sin CSV de resúmenes — se usan extractos del cuerpo"); return; }
  const rows = parseCsv(text);
  const head = rows[0].map((h) => h.trim());
  const col = (n: string) => head.indexOf(n);
  const ci = col("nombre_cientifico");
  const cd = col("resumen_descripcion"), cid = col("resumen_como_identificarla");
  const cs = col("resumen_sabias_que"), cw = col("resumen_donde_cuando");
  if (ci < 0) return;
  let n = 0;
  for (const r of rows.slice(1)) {
    const sci = (r[ci] ?? "").trim().toLowerCase();
    if (!sci) continue;
    const g = (k: number) => (k >= 0 ? (r[k] ?? "").trim() : "");
    RES[sci] = { desc: g(cd) || undefined, id: g(cid) || undefined, sabias: g(cs) || undefined, donde: g(cw) || undefined };
    if (RES[sci].desc || RES[sci].id || RES[sci].sabias || RES[sci].donde) n++;
  }
  console.log(`  ${n} resúmenes curados desde ${path.basename(RESUMENES_CSV)}`);
}

/* Créditos fotográficos: fotógrafos únicos de las fotos USADAS, con conteo y
   licencia. El crédito iNaturalist viene como "(c) Nombre, some rights reserved
   (CC BY)"; se extrae nombre y licencia. La atribución por foto va en cada ficha. */
function aggregateCredits(aves: FichaEspecie[]): { name: string; count: number; license?: string }[] {
  const map = new Map<string, { count: number; license?: string }>();
  for (const f of aves) {
    const raw = (chosenFoto(f)?.credito ?? "").trim();
    if (!raw) continue;
    const m = raw.match(/^\(c\)\s*(.+?),\s*some rights reserved\s*\(([^)]+)\)/i);
    const name = (m ? m[1] : raw).trim();
    const license = m ? m[2].trim() : undefined;
    const cur = map.get(name) ?? { count: 0, license };
    cur.count++;
    if (license) cur.license = license;
    map.set(name, cur);
  }
  return [...map.entries()]
    .map(([name, v]) => ({ name, count: v.count, license: v.license }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));
}

/* Entrada de `fotos` correspondiente a la foto elegida (selección por stem),
   o la primera si no hay selección. De ahí salen crédito y licencia correctos. */
function chosenFoto(f: FichaEspecie) {
  const pick = SELS[f.slug]?.archivo;
  if (pick) {
    const stem = path.parse(pick).name.toLowerCase();
    const hit = f.fotos?.find((p) => path.parse(p.archivo).name.toLowerCase() === stem);
    if (hit) return hit;
  }
  return f.fotos?.[0];
}

/* ---- imagen desde el banco local → data-URI (sharp) ----
   Usa la selección/encuadre de photo-selections.json si existe; si no, la
   primera foto de la ficha (recorte centrado vía object-cover en la plantilla). */
const imgCache = new Map<string, string | null>();
async function resolvePhoto(f: FichaEspecie): Promise<string | null> {
  const pick = SELS[f.slug]?.archivo;                 // foto elegida en la herramienta
  const archivo = pick ?? f.fotos?.[0]?.archivo;
  if (!archivo) { warn(`${f.slug}: ficha sin fotos`); return null; }
  const crop = SELS[f.slug]?.crop;
  const key = `${f.nombreCientifico}/${archivo}/${crop ? `${crop.x},${crop.y},${crop.w},${crop.h}` : "full"}`;
  if (imgCache.has(key)) return imgCache.get(key)!;

  const dir = path.join(BANCO_DIR, f.nombreCientifico);
  let chosen: string | null = null;
  try {
    const files = await readdir(dir);
    const stem = path.parse(archivo).name.toLowerCase();
    chosen = files.find((x) => x.toLowerCase() === archivo.toLowerCase())   // nombre exacto (selección)
      ?? files.find((x) => path.parse(x).name.toLowerCase() === stem)        // por stem
      ?? files.find((x) => /\.(jpe?g|png|webp|tiff?)$/i.test(x))             // primera disponible
      ?? null;
    if (chosen) chosen = path.join(dir, chosen);
  } catch {
    warn(`${f.slug}: no existe la carpeta de banco "${dir}" — usa placeholder`);
    imgCache.set(key, null);
    return null;
  }
  if (!chosen) { warn(`${f.slug}: sin imagen en "${dir}" — usa placeholder`); imgCache.set(key, null); return null; }

  try {
    // Enderezar EXIF primero y trabajar sobre el buffer ya rotado: así las
    // dimensiones para el recorte coinciden con la orientación que vio la
    // herramienta de selección (evita "bad extract area" en fotos verticales).
    const rotated = await sharp(chosen).rotate().toBuffer();
    let img = sharp(rotated);
    if (crop) {
      const meta = await img.metadata();
      const W = meta.width ?? 0, H = meta.height ?? 0;
      const left = Math.min(W - 1, Math.max(0, Math.round(crop.x * W)));
      const top = Math.min(H - 1, Math.max(0, Math.round(crop.y * H)));
      const width = Math.max(1, Math.min(W - left, Math.round(crop.w * W)));
      const height = Math.max(1, Math.min(H - top, Math.round(crop.h * H)));
      img = sharp(rotated).extract({ left, top, width, height });
    }
    const buf = await img.resize({ width: 1180, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    const uri = `data:image/jpeg;base64,${buf.toString("base64")}`;
    imgCache.set(key, uri);
    return uri;
  } catch (e) {
    warn(`${f.slug}: error procesando "${chosen}": ${(e as Error).message} — usa placeholder`);
    imgCache.set(key, null);
    return null;
  }
}

async function qr(url: string, dark = "#0c5a36"): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, scale: 8, color: { dark, light: "#ffffff" }, errorCorrectionLevel: "M" });
}

async function whiteLogoDataUri(): Promise<string | null> {
  try {
    const buf = await sharp(path.join(PRINT_DIR, "assets", "logo-chirimoyo-blanco.png"))
      .resize({ width: 240 }).png().toBuffer();
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch { return null; }
}

async function logoDataUri(): Promise<string | null> {
  // logo del proyecto (si existe en el banco/handoff); opcional.
  for (const p of [
    path.join(BANCO_DIR, "..", "logo-comunidad-chirimoyo.jpeg"),
    path.join(APP, "public", "logo-chirimoyo.jpeg"),
  ]) {
    try {
      const buf = await sharp(await readFile(p)).resize({ width: 120 }).png().toBuffer();
      return `data:image/png;base64,${buf.toString("base64")}`;
    } catch { /* siguiente */ }
  }
  return null;
}

/* ---- layout del índice: reparte items en columnas/páginas ---- */
function layoutIndex(species: SpeciesVM[]): { pages: IndexPageVM[]; count: number } {
  const byGuild = new Map<string, SpeciesVM[]>();
  for (const s of species) (byGuild.get(s.gremio) ?? byGuild.set(s.gremio, []).get(s.gremio)!).push(s);
  const guilds = [...byGuild.keys()].sort((a, b) => guildRank(a) - guildRank(b) || a.localeCompare(b, "es"));

  // lista lineal de items con su "coste" vertical en unidades
  type U = { item: IndexItem; cost: number; isGuild: boolean };
  const units: U[] = [];
  for (const g of guilds) {
    const rows = byGuild.get(g)!;
    units.push({ item: { kind: "guild", key: g, dot: GUILD_DOT[g] ?? "#15824c", count: rows.length }, cost: 3.2, isGuild: true });
    for (const s of rows) units.push({ item: { kind: "row", name: s.common, sci: s.sci, pg: s.n }, cost: 1, isGuild: false });
  }

  const pages: IndexPageVM[] = [];
  let col: IndexItem[] = [];
  let colIdx = 0;
  let used = 0;
  let page: IndexItem[][] = [[], []];
  const budget = () => (pages.length === 0 ? 22 : 30); // 1ª página lleva cabecera

  const flushCol = () => { page[colIdx] = col; col = []; used = 0; };
  const flushPage = () => { pages.push({ columns: [page[0], page[1]], showHeader: pages.length === 0, totalGuilds: guilds.length }); page = [[], []]; colIdx = 0; };

  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    // no dejar un encabezado de gremio huérfano al final de la columna
    const headerOrphan = u.isGuild && used + u.cost > budget() - 1;
    if (used + u.cost > budget() || headerOrphan) {
      flushCol();
      colIdx++;
      if (colIdx > 1) { flushPage(); }
    }
    col.push(u.item);
    used += u.cost;
  }
  flushCol();
  flushPage();
  return { pages, count: pages.length };
}

async function main() {
  console.log("→ Generando PDF del catálogo…");
  try {
    SELS = JSON.parse(await readFile(SELECTIONS, "utf8"));
    console.log(`  ${Object.keys(SELS).length} selección(es) de foto desde ${path.basename(SELECTIONS)}`);
  } catch {
    console.log("  Sin photo-selections.json — se usa la primera foto de cada ficha");
  }
  await loadResumenes();
  const fichas = await getAllFichas();
  const aves = fichas.filter((f) => f.grupo === "aves");
  console.log(`  ${aves.length} especies leídas de content/`);

  // orden de presentación: por gremio, luego nombre común
  aves.sort((a, b) => guildRank(a.categoria) - guildRank(b.categoria) || a.nombreComun.localeCompare(b.nombreComun, "es"));

  const total = aves.length;
  const logo = await logoDataUri();
  const logoBlanco = await whiteLogoDataUri();

  // primer pase: VM sin folio (n se fija tras conocer K)
  const species: SpeciesVM[] = [];
  for (const f of aves) {
    const sec = sections(f.cuerpo);
    const photo = await resolvePhoto(f);
    const iucn = (f.conservacion.iucn ?? "").toUpperCase();
    species.push({
      n: 0, slug: f.slug, gremio: f.categoria,
      gremioTone: GUILD_TONE[f.categoria] ?? { bg: "#cdeedd", fg: "#0c5a36" },
      common: f.nombreComun, sci: f.nombreCientifico, authority: f.autoridad ?? "",
      otros: (f.otrosNombres ?? []).join(" · "),
      photo, photoCaption: `Foto — ${f.nombreComun}`,
      credit: chosenFoto(f)?.credito ?? "", license: chosenFoto(f)?.licencia ?? "",
      status: statusChips(f),
      iucn: { code: iucn || "—", tone: IUCN_TONE[iucn] ?? "ink" },
      nom: NOM_LABEL[f.conservacion.nom059] ?? "—",
      orden: f.orden, familia: f.familia, genero: f.genero,
      medidas: medidas(f),
      habitat: (f.habitat ?? []).join(" · "),
      cuando: f.mejorHora ?? f.temporada?.notas ?? "",
      blocks: ((r) => ({
        desc: r?.desc ?? clip(sec["descripcion"]),
        id: r?.id ?? clip(sec["como identificarla"]),
        sabias: r?.sabias ?? clip(sec["sabias que"]),
        donde: r?.donde ?? clip(sec["donde y cuando observarla"]),
      }))(RES[f.nombreCientifico.trim().toLowerCase()]),
      qr: await qr(`${AVES_BASE}/aves/${f.slug}`),
    });
  }

  // numeración de ficha (catálogo): 1..N, en orden de presentación. El índice
  // referencia este "nº de ficha", no la página física del PDF.
  species.forEach((s, i) => { s.n = i + 1; });
  const indexPages = layoutIndex(species).pages;       // usa s.n como nº de ficha
  const K = indexPages.length;
  const totalPages = 2 + K + total + 1;                // portada + intro + índice + fichas + cierre

  // portada: especie destacada o emblema local (oropéndola) o la primera
  const cover = aves.find((f) => f.featured)
    ?? aves.find((f) => f.slug === "psarocolius-montezuma")
    ?? aves[0];
  const coverPhoto = species.find((s) => s.slug === cover.slug)?.photo ?? null;

  const data: CatalogData = {
    total, totalPages, edicion: EDICION,
    cover: { photo: coverPhoto, sci: cover.nombreCientifico, logo },
    species, indexPages,
    credits: aggregateCredits(aves),
    fuentes: [
      { name: "eBird", org: "Cornell Lab of Ornithology" },
      { name: "Enciclovida", org: "CONABIO · México" },
      { name: "Birds of the World", org: "Cornell Lab" },
      { name: "BirdLife / UICN", org: "Estado de conservación" },
    ],
    qrSitio: await qr(`${AVES_BASE}/`),
    logo,
    logoBlanco,
  };

  // render
  const css = await readFile(path.join(PRINT_DIR, "_print.generated.css"), "utf8");
  const body = renderToStaticMarkup(React.createElement(Document, { data }));
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><style>
${css}
*{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style></head><body>${body}</body></html>`;

  const tmp = path.join(PRINT_DIR, "_render.html");
  await writeFile(tmp, html, "utf8");

  console.log(`  Renderizando ${totalPages} páginas con Chromium…`);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto("file://" + tmp.replace(/\\/g, "/"), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await mkdir(path.dirname(OUT), { recursive: true });
    await page.pdf({ path: OUT, format: "A4", printBackground: true, preferCSSPageSize: true });

    if (process.env.PDF_SHOTS) {
      const shotDir = path.join(PRINT_DIR, "_shots");
      await mkdir(shotDir, { recursive: true });
      const sheets = page.locator(".a4");
      const idx: Record<string, number> = {
        "01-portada": 0, "02-intro": 1, "03-indice": 2,
        "05-ficha-primera": 2 + K, "04-ficha-garcita": 2 + K + 1,
        "06-ficha-montezuma": -1, "99-cierre": -1,
      };
      const montezumaPage = data.species.findIndex((s) => s.slug === "psarocolius-montezuma");
      idx["06-ficha-montezuma"] = montezumaPage >= 0 ? 2 + K + montezumaPage : 2 + K;
      const longPage = data.species.findIndex((s) => s.slug === "hirundo-rustica");
      if (longPage >= 0) idx["07-ficha-larga"] = 2 + K + longPage;
      const exifPage = data.species.findIndex((s) => s.slug === "egretta-caerulea");
      if (exifPage >= 0) idx["08-ficha-exif"] = 2 + K + exifPage;
      idx["99-cierre"] = totalPages - 1;
      for (const [name, i] of Object.entries(idx)) {
        await sheets.nth(i).screenshot({ path: path.join(shotDir, `${name}.png`) });
      }
      console.log(`  Capturas en ${shotDir}`);
    }
  } finally {
    await browser.close();
    await unlink(tmp).catch(() => {});
  }

  console.log(`✓ PDF escrito en ${OUT} (${totalPages} páginas, ${total} especies, ${K} de índice)`);
  if (warnings.length) console.log(`  ${warnings.length} aviso(s) durante la generación.`);
}

main().catch((e) => { console.error("✗ Falló la generación del PDF:", e); process.exit(1); });
