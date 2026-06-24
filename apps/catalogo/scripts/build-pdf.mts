/* =====================================================================
   build-pdf.mts — genera los PDFs del catálogo por DISCIPLINA (#94):
   ornitología (aves) y herpetología (anfibios + reptiles). En BUILD, a
   partir de content/ y de la copia local de imágenes. Sin red (salvo el
   Chromium ya instalado), sin API. Ver ADR-0019 / design.

   Un único generador `generarCatalogo(config)` se corre una vez por
   disciplina; la `CatalogoConfig` captura lo que difiere (grupos, copy de
   marca, orden/tonos de categoría, CSV de resúmenes, archivo de salida).

   Variables de entorno:
     FAUNA_BANCO_DIR        banco local de imágenes de aves (default conocido).
     FAUNA_BANCO_HERPS_DIR  banco local de imágenes de herpetofauna (default conocido).
     SITE_BASE              base del sitio (default https://fauna.chirimoyo.org).
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
import type { FichaEspecie, Grupo } from "../lib/fauna-schema.ts";
import {
  MIGRATORIO_LABEL, OCURRENCIA_LABEL, DISTRIBUCION_LABEL,
} from "../lib/dictionary.ts";
import { Document } from "../print/templates/Document.tsx";
import type {
  CatalogData, CatalogMeta, SpeciesVM, IndexItem, IndexPageVM, Medida, StatusChip,
} from "../print/templates/types.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");                       // apps/catalogo
const PRINT_DIR = path.join(APP, "print");
const ORIGEN_DIR = path.resolve(APP, "..", "..", "content", "fauna", "_origen");

const BANCO_DIR = process.env.FAUNA_BANCO_DIR
  ?? "C:\\Users\\Frank\\Downloads\\Img guia aves\\Imagenes aves";
const BANCO_HERPS_DIR = process.env.FAUNA_BANCO_HERPS_DIR
  ?? "C:\\Users\\Frank\\Documents\\guia aves Roldan\\anfibios-reptiles\\fotos";
const SITE_BASE = (process.env.SITE_BASE ?? "https://fauna.chirimoyo.org").replace(/\/$/, "");
const SELECTIONS = process.env.PHOTO_SELECTIONS ?? path.join(PRINT_DIR, "photo-selections.json");
const EDICION = "2026";

/* ---- configuración por disciplina ---- */
interface CatalogoConfig {
  slug: string;                                  // "ornitologia" | "herpetofauna" (logs/gating)
  grupos: Grupo[];                               // grupos incluidos
  bancoDir: string;                              // banco local de imágenes de la disciplina
  out: string;                                   // ruta absoluta del PDF
  resumenesCsv: string;                          // CSV de resúmenes curados
  ordenCategorias: string[];                     // orden de categorías (gremios | clases)
  categoriaTone: Record<string, { bg: string; fg: string }>;
  categoriaDot: Record<string, string>;
  coverSlug?: string;                            // portada de respaldo si nadie es `featured`
  fuentes: Array<{ name: string; org: string }>;
  meta: CatalogMeta;                             // copy de marca
}

/** Selección/encuadre de foto por especie (generado con `npm run photo:tool`). */
type Crop = { x: number; y: number; w: number; h: number };
let SELS: Record<string, { archivo: string; crop?: Crop }> = {};

const warnings: string[] = [];
const warn = (m: string) => { warnings.push(m); console.warn("  ⚠ " + m); };

const rankCategoria = (c: string, orden: string[]) => {
  const i = orden.indexOf(c);
  return i === -1 ? orden.length : i;
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

/* ---- medidas: rotula la talla con el criterio de la ficha (p. ej. «LHC
   (hocico-cloaca)» en herpetofauna), cayendo a «Tamaño»; envergadura solo aves. */
function medidas(f: FichaEspecie): Medida[] {
  const out: Medida[] = [];
  const rango = (r?: [number, number]) => r ? `${r[0]}–${r[1]}` : null;
  const t = rango(f.medidas?.tamanoCm);
  if (t) out.push({ k: f.medidas?.criterio?.trim() || "Tamaño", v: t, u: "cm" });
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

/* ---- resúmenes curados (≤350c) desde el CSV de origen de la disciplina ----
   Columnas: resumen_descripcion, resumen_como_identificarla, resumen_sabias_que,
   resumen_donde_cuando. Casan por nombre científico. Tienen prioridad sobre el
   recorte automático del cuerpo Markdown. */
type Resumen = { desc?: string; id?: string; sabias?: string; donde?: string };
let RES: Record<string, Resumen> = {};

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

async function loadResumenes(csvPath: string) {
  RES = {};
  let text: string;
  try { text = await readFile(csvPath, "utf8"); }
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
  console.log(`  ${n} resúmenes curados desde ${path.basename(csvPath)}`);
}

/* Créditos fotográficos: fotógrafos únicos de las fotos USADAS, con conteo y
   licencia. El crédito iNaturalist viene como "(c) Nombre, some rights reserved
   (CC BY)"; se extrae nombre y licencia. La atribución por foto va en cada ficha. */
function aggregateCredits(especies: FichaEspecie[]): { name: string; count: number; license?: string }[] {
  const map = new Map<string, { count: number; license?: string }>();
  for (const f of especies) {
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

/* ---- imagen desde el banco local → data-URI (sharp). El banco es compartido
   por aves y herpetofauna (mismo que descargar-imagenes/migrar-fauna). ---- */
const imgCache = new Map<string, string | null>();
async function resolvePhoto(f: FichaEspecie, bancoDir: string): Promise<string | null> {
  const pick = SELS[f.slug]?.archivo;                 // foto elegida en la herramienta
  const archivo = pick ?? f.fotos?.[0]?.archivo;
  if (!archivo) { warn(`${f.slug}: ficha sin fotos`); return null; }
  const crop = SELS[f.slug]?.crop;
  const key = `${f.nombreCientifico}/${archivo}/${crop ? `${crop.x},${crop.y},${crop.w},${crop.h}` : "full"}`;
  if (imgCache.has(key)) return imgCache.get(key)!;

  const dir = path.join(bancoDir, f.nombreCientifico);
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
  for (const p of [
    path.join(BANCO_DIR, "..", "logo-comunidad-chirimoyo.jpeg"),
    path.join(APP, "public", "logo-chirimoyo.png"),
  ]) {
    try {
      const buf = await sharp(await readFile(p)).resize({ width: 120 }).png().toBuffer();
      return `data:image/png;base64,${buf.toString("base64")}`;
    } catch { /* siguiente */ }
  }
  return null;
}

/* ---- layout del índice: reparte items en columnas/páginas, por categoría ---- */
function layoutIndex(species: SpeciesVM[], config: CatalogoConfig): { pages: IndexPageVM[]; count: number } {
  const byCat = new Map<string, SpeciesVM[]>();
  for (const s of species) (byCat.get(s.gremio) ?? byCat.set(s.gremio, []).get(s.gremio)!).push(s);
  const cats = [...byCat.keys()].sort(
    (a, b) => rankCategoria(a, config.ordenCategorias) - rankCategoria(b, config.ordenCategorias) || a.localeCompare(b, "es"),
  );

  type U = { item: IndexItem; cost: number; isGuild: boolean };
  const units: U[] = [];
  for (const g of cats) {
    const rows = byCat.get(g)!;
    units.push({ item: { kind: "guild", key: g, dot: config.categoriaDot[g] ?? "#15824c", count: rows.length }, cost: 3.2, isGuild: true });
    for (const s of rows) units.push({ item: { kind: "row", name: s.common, sci: s.sci, pg: s.n }, cost: 1, isGuild: false });
  }

  const pages: IndexPageVM[] = [];
  let col: IndexItem[] = [];
  let colIdx = 0;
  let used = 0;
  let page: IndexItem[][] = [[], []];
  const budget = () => (pages.length === 0 ? 22 : 30); // 1ª página lleva cabecera

  const flushCol = () => { page[colIdx] = col; col = []; used = 0; };
  const flushPage = () => { pages.push({ columns: [page[0], page[1]], showHeader: pages.length === 0, totalGuilds: cats.length }); page = [[], []]; colIdx = 0; };

  for (let i = 0; i < units.length; i++) {
    const u = units[i];
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

/* ---- genera UN catálogo (una disciplina) ---- */
async function generarCatalogo(config: CatalogoConfig, allFichas: FichaEspecie[]) {
  console.log(`→ Generando catálogo ${config.slug}…`);
  await loadResumenes(config.resumenesCsv);
  const especies = allFichas.filter((f) => config.grupos.includes(f.grupo));
  console.log(`  ${especies.length} especies (${config.grupos.join(", ")})`);

  // orden de presentación: por categoría (orden de la disciplina), luego nombre común
  especies.sort((a, b) =>
    rankCategoria(a.categoria, config.ordenCategorias) - rankCategoria(b.categoria, config.ordenCategorias)
    || a.nombreComun.localeCompare(b.nombreComun, "es"));

  const total = especies.length;
  const logo = await logoDataUri();
  const logoBlanco = await whiteLogoDataUri();

  const speciesVM: SpeciesVM[] = [];
  for (const f of especies) {
    const sec = sections(f.cuerpo);
    const photo = await resolvePhoto(f, config.bancoDir);
    const iucn = (f.conservacion.iucn ?? "").toUpperCase();
    speciesVM.push({
      n: 0, slug: f.slug, gremio: f.categoria,
      gremioTone: config.categoriaTone[f.categoria] ?? { bg: "#cdeedd", fg: "#0c5a36" },
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
      qr: await qr(`${SITE_BASE}/${f.grupo}/${f.slug}`),
    });
  }

  speciesVM.forEach((s, i) => { s.n = i + 1; });
  const indexPages = layoutIndex(speciesVM, config).pages;
  const K = indexPages.length;
  const totalPages = 2 + K + total + 1;                // portada + intro + índice + fichas + cierre

  // portada: destacada, luego el slug de respaldo de la config, luego la primera
  const cover = especies.find((f) => f.featured)
    ?? (config.coverSlug ? especies.find((f) => f.slug === config.coverSlug) : undefined)
    ?? especies[0];
  const coverPhoto = speciesVM.find((s) => s.slug === cover.slug)?.photo ?? null;

  const data: CatalogData = {
    total, totalPages, edicion: EDICION, meta: config.meta,
    cover: { photo: coverPhoto, sci: cover.nombreCientifico, logo },
    species: speciesVM, indexPages,
    credits: aggregateCredits(especies),
    fuentes: config.fuentes,
    qrSitio: await qr(`${SITE_BASE}/`),
    logo, logoBlanco,
  };

  const css = await readFile(path.join(PRINT_DIR, "_print.generated.css"), "utf8");
  const body = renderToStaticMarkup(React.createElement(Document, { data }));
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><style>
${css}
*{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style></head><body>${body}</body></html>`;

  const tmp = path.join(PRINT_DIR, `_render-${config.slug}.html`);
  await writeFile(tmp, html, "utf8");

  console.log(`  Renderizando ${totalPages} páginas con Chromium…`);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto("file://" + tmp.replace(/\\/g, "/"), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await mkdir(path.dirname(config.out), { recursive: true });
    await page.pdf({ path: config.out, format: "A4", printBackground: true, preferCSSPageSize: true });
  } finally {
    await browser.close();
    await unlink(tmp).catch(() => {});
  }

  console.log(`✓ PDF ${config.slug} en ${config.out} (${totalPages} páginas, ${total} especies, ${K} de índice)`);
}

/* ---- configuraciones por disciplina ---- */
const ORNITOLOGIA: CatalogoConfig = {
  slug: "ornitologia",
  grupos: ["aves"],
  bancoDir: BANCO_DIR,
  out: process.env.PDF_OUT ?? path.join(APP, "public", "catalogo-aves-chirimoyo.pdf"),
  resumenesCsv: path.join(ORIGEN_DIR, "aves-especies.csv"),
  ordenCategorias: ["Vadeadoras", "Nadadoras", "Playeras", "Voladoras", "Rapaces y Carroñeras", "Terrestres"],
  categoriaDot: {
    Vadeadoras: "#2f9d6a", Nadadoras: "#3f6f9e", Playeras: "#b08a2e",
    Voladoras: "#6a4d86", "Rapaces y Carroñeras": "#b5543a", Terrestres: "#5e6b22",
  },
  categoriaTone: {
    Vadeadoras: { bg: "#cdeedd", fg: "#0c5a36" },
    Nadadoras: { bg: "#d8e6f0", fg: "#2c5a7a" },
    Playeras: { bg: "#ece2cf", fg: "#8a6d3b" },
    Voladoras: { bg: "#e6dcef", fg: "#6a4d86" },
    "Rapaces y Carroñeras": { bg: "#f6e1da", fg: "#8f3c25" },
    Terrestres: { bg: "#e3e9cf", fg: "#5e6b22" },
  },
  coverSlug: "psarocolius-montezuma",
  fuentes: [
    { name: "eBird", org: "Cornell Lab of Ornithology" },
    { name: "Enciclovida", org: "CONABIO · México" },
    { name: "Birds of the World", org: "Cornell Lab" },
    { name: "BirdLife / UICN", org: "Estado de conservación" },
  ],
  meta: {
    coverTituloLineas: ["Catálogo de aves", "del humedal de"],
    introTitulo: "Un humedal vivo, ave por ave",
    introParrafo: "Esta guía reúne las aves que la comunidad ha observado y documentado. Cada ficha resume, en una sola página, lo esencial para reconocer un ave en el campo y entender su papel en el ecosistema. Consérvala seca, llévala al campo y compártela: conocer estas especies es el primer paso para defender el humedal.",
    observaPista: "Fíjate en tamaño, color, pico y dónde está el ave.",
    sitioLabel: "fauna.chirimoyo.org",
    footerTitulo: "Catálogo de aves del humedal de Chirimoyo",
    indiceSubtitulo: "aves del humedal, agrupadas por gremio",
    categoriaPlural: "gremios",
  },
};

const HERPETOFAUNA: CatalogoConfig = {
  slug: "herpetofauna",
  grupos: ["anfibios", "reptiles"],
  bancoDir: BANCO_HERPS_DIR,
  out: path.join(APP, "public", "catalogo-herpetofauna-chirimoyo.pdf"),
  resumenesCsv: path.join(ORIGEN_DIR, "anfibios-reptiles-especies.csv"),
  ordenCategorias: ["Anuros", "Salamandras", "Lagartijas", "Serpientes", "Tortugas"],
  categoriaDot: {
    Anuros: "#456a2e", Salamandras: "#2f6b5a", Lagartijas: "#7a6a2f",
    Serpientes: "#6a533b", Tortugas: "#3b537a",
  },
  categoriaTone: {
    Anuros: { bg: "#dce8d4", fg: "#456a2e" },
    Salamandras: { bg: "#d6e8e2", fg: "#2f6b5a" },
    Lagartijas: { bg: "#e8e2cf", fg: "#7a6a2f" },
    Serpientes: { bg: "#e6dccf", fg: "#6a533b" },
    Tortugas: { bg: "#d8e0ea", fg: "#3b537a" },
  },
  coverSlug: "incilius-valliceps",
  fuentes: [
    { name: "AmphibiaWeb", org: "UC Berkeley" },
    { name: "The Reptile Database", org: "reptile-database.org" },
    { name: "Enciclovida", org: "CONABIO · México" },
    { name: "UICN", org: "Estado de conservación" },
  ],
  meta: {
    coverTituloLineas: ["Catálogo de", "herpetofauna del", "humedal de"],
    introTitulo: "Un humedal vivo y diverso",
    introParrafo: "Esta guía reúne los anfibios y reptiles que la comunidad ha observado y documentado. Cada ficha resume, en una sola página, lo esencial para reconocer una especie en el campo y entender su papel en el ecosistema. Consérvala seca, llévala al campo y compártela: conocer estas especies es el primer paso para defender el humedal.",
    observaPista: "Fíjate en tamaño, forma, color y dónde está el animal.",
    sitioLabel: "fauna.chirimoyo.org",
    footerTitulo: "Catálogo de herpetofauna del humedal de Chirimoyo",
    indiceSubtitulo: "especies del humedal, agrupadas por clase",
    categoriaPlural: "clases",
  },
};

async function main() {
  console.log("→ Generando los PDFs del catálogo (ornitología + herpetología)…");
  try {
    SELS = JSON.parse(await readFile(SELECTIONS, "utf8"));
    console.log(`  ${Object.keys(SELS).length} selección(es) de foto desde ${path.basename(SELECTIONS)}`);
  } catch {
    console.log("  Sin photo-selections.json — se usa la primera foto de cada ficha");
  }
  const fichas = await getAllFichas();
  for (const config of [ORNITOLOGIA, HERPETOFAUNA]) {
    await generarCatalogo(config, fichas);
  }
  if (warnings.length) console.log(`  ${warnings.length} aviso(s) durante la generación.`);
}

main().catch((e) => { console.error("✗ Falló la generación del PDF:", e); process.exit(1); });
