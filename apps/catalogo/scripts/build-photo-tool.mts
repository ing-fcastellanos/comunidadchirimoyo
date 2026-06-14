/* =====================================================================
   build-photo-tool.mts — genera una herramienta HTML autocontenida para
   ELEGIR y ENCUADRAR la foto de cada ave que se usará en el PDF (#14).

   Uso:
     npm run photo:tool          → escribe print/_photo-tool.html
     abrir ese archivo en el navegador, elegir foto + encuadre por ave,
     "Exportar JSON" → guardar como apps/catalogo/print/photo-selections.json

   El recorte se exporta NORMALIZADO (0..1) respecto a la imagen original,
   de modo que build-pdf.mts lo aplica a máxima resolución con sharp.
   ===================================================================== */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { getAllFichas } from "../lib/content.ts";
import { PHOTO_ASPECT } from "./photo-aspect.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
const PRINT_DIR = path.join(APP, "print");
const BANCO_DIR = process.env.FAUNA_BANCO_DIR
  ?? "C:\\Users\\Frank\\Downloads\\Img guia aves\\Imagenes aves";
const SELECTIONS = process.env.PHOTO_SELECTIONS ?? path.join(PRINT_DIR, "photo-selections.json");
const OUT = path.join(PRINT_DIR, "_photo-tool.html");

const IMG_RE = /\.(jpe?g|png|webp|tiff?)$/i;

type PhotoVM = { archivo: string; thumb: string };
type BirdVM = { slug: string; common: string; sci: string; def: string; photos: PhotoVM[] };

async function thumb(file: string): Promise<string> {
  const buf = await sharp(file).rotate().resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 70 }).toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

async function main() {
  console.log("→ Generando herramienta de selección de fotos…");
  const fichas = (await getAllFichas()).filter((f) => f.grupo === "aves");
  fichas.sort((a, b) => a.nombreComun.localeCompare(b.nombreComun, "es"));

  let preselect: Record<string, unknown> = {};
  try { preselect = JSON.parse(await readFile(SELECTIONS, "utf8")); } catch { /* aún no existe */ }

  const birds: BirdVM[] = [];
  let n = 0;
  for (const f of fichas) {
    const dir = path.join(BANCO_DIR, f.nombreCientifico);
    let files: string[] = [];
    try { files = (await readdir(dir)).filter((x) => IMG_RE.test(x)).sort(); } catch { /* sin carpeta */ }
    const photos: PhotoVM[] = [];
    for (const file of files) {
      try { photos.push({ archivo: file, thumb: await thumb(path.join(dir, file)) }); n++; }
      catch { /* salta imagen ilegible */ }
    }
    const def = path.parse(f.fotos?.[0]?.archivo ?? "").name;
    const defFile = photos.find((p) => path.parse(p.archivo).name.toLowerCase() === def.toLowerCase())?.archivo
      ?? photos[0]?.archivo ?? "";
    birds.push({ slug: f.slug, common: f.nombreComun, sci: f.nombreCientifico, def: defFile, photos });
    console.log(`  ${f.nombreComun}: ${photos.length} foto(s)`);
  }
  console.log(`  ${n} miniaturas embebidas`);

  const html = page(JSON.stringify(birds), JSON.stringify(preselect), PHOTO_ASPECT);
  await writeFile(OUT, html, "utf8");
  console.log(`✓ Herramienta en ${OUT}`);
  console.log(`  Ábrela en el navegador, elige y encuadra, y exporta a:\n  ${SELECTIONS}`);
}

/* ------- declaraciones para el cliente (solo para typecheck del .toString) ------- */
declare const BIRDS: BirdVM[];
declare const PRESELECT: Record<string, { archivo: string; crop: { x: number; y: number; w: number; h: number } }>;
declare const ASPECT: number;

/* ------- lógica del cliente; se serializa con .toString() ------- */
function client() {
  const $ = (s: string) => document.querySelector(s) as HTMLElement;
  const sel: Record<string, { archivo: string; crop: { x: number; y: number; w: number; h: number } }> = {};
  Object.assign(sel, PRESELECT);

  const Wf = 520, Hf = Math.round(520 / ASPECT);
  let cur = 0;                 // índice de ave activa
  let curImg: HTMLImageElement | null = null;
  let Wi = 0, Hi = 0, sCover = 1, s = 1, tx = 0, ty = 0, z = 1;
  let drag: { x: number; y: number } | null = null;

  /* ---- lista de aves ---- */
  const list = $("#list");
  BIRDS.forEach((b, i) => {
    const el = document.createElement("div");
    el.className = "bird";
    el.dataset.i = String(i);
    el.innerHTML = '<span class="nm"></span><span class="badge"></span>';
    (el.querySelector(".nm") as HTMLElement).textContent = b.common;
    el.onclick = () => load(i);
    list.appendChild(el);
  });

  function refreshList() {
    document.querySelectorAll(".bird").forEach((el) => {
      const i = Number((el as HTMLElement).dataset.i);
      el.classList.toggle("active", i === cur);
      const done = !!sel[BIRDS[i].slug];
      (el.querySelector(".badge") as HTMLElement).textContent = done ? "✓" : "";
      el.classList.toggle("done", done);
    });
    const done = Object.keys(sel).length;
    $("#count").textContent = done + " / " + BIRDS.length + " guardadas";
  }

  /* ---- recorte: cálculo ---- */
  function clamp() {
    tx = Math.min(0, Math.max(Wf - Wi * s, tx));
    ty = Math.min(0, Math.max(Hf - Hi * s, ty));
  }
  function apply() {
    if (!curImg) return;
    curImg.style.width = Wi * s + "px";
    curImg.style.height = Hi * s + "px";
    curImg.style.transform = "translate(" + tx + "px," + ty + "px)";
  }
  function cropOf() {
    return { x: -tx / s / Wi, y: -ty / s / Hi, w: Wf / s / Wi, h: Hf / s / Hi };
  }
  function save() {
    const b = BIRDS[cur];
    const archivo = (document.querySelector(".thumb.sel") as HTMLElement)?.dataset.f;
    if (!archivo) return;
    sel[b.slug] = { archivo, crop: cropOf() };
    refreshList();
  }

  function setZoom(nz: number) {
    const cx = (-tx + Wf / 2) / s, cy = (-ty + Hf / 2) / s;   // punto-fuente bajo el centro
    z = Math.max(1, Math.min(5, nz));
    s = sCover * z;
    tx = Wf / 2 - cx * s; ty = Hf / 2 - cy * s;
    clamp(); apply(); save();
    ($("#zoom") as HTMLInputElement).value = String(z);
  }

  /* ---- elegir foto ---- */
  function choose(archivo: string, crop?: { x: number; y: number; w: number; h: number }) {
    document.querySelectorAll(".thumb").forEach((t) =>
      t.classList.toggle("sel", (t as HTMLElement).dataset.f === archivo));
    const b = BIRDS[cur];
    const ph = b.photos.find((p) => p.archivo === archivo);
    if (!ph) return;
    const img = new Image();
    img.onload = () => {
      Wi = img.naturalWidth; Hi = img.naturalHeight;
      sCover = Math.max(Wf / Wi, Hf / Hi);
      const frame = $("#frame");
      frame.innerHTML = "";
      img.className = "cropimg";
      img.draggable = false;
      frame.appendChild(img);
      curImg = img;
      if (crop) {
        s = Wf / (crop.w * Wi); z = s / sCover;
        tx = -crop.x * Wi * s; ty = -crop.y * Hi * s;
      } else {
        z = 1; s = sCover; tx = (Wf - Wi * s) / 2; ty = (Hf - Hi * s) / 2;
      }
      clamp(); apply();
      ($("#zoom") as HTMLInputElement).value = String(z);
      save();
    };
    img.src = ph.thumb;
  }

  /* ---- cargar ave ---- */
  function load(i: number) {
    cur = i;
    const b = BIRDS[i];
    $("#title").textContent = b.common;
    $("#sci").textContent = b.sci;
    const strip = $("#thumbs");
    strip.innerHTML = "";
    if (!b.photos.length) { strip.innerHTML = '<p class="empty">Sin fotos en el banco.</p>'; $("#frame").innerHTML = ""; }
    b.photos.forEach((p) => {
      const t = document.createElement("img");
      t.className = "thumb"; t.src = p.thumb; t.dataset.f = p.archivo;
      t.onclick = () => choose(p.archivo);
      strip.appendChild(t);
    });
    const saved = sel[b.slug];
    const pick = saved?.archivo ?? b.def ?? b.photos[0]?.archivo;
    if (pick) choose(pick, saved?.crop);
    refreshList();
  }

  /* ---- interacción del marco ---- */
  const frame = $("#frame");
  frame.addEventListener("pointerdown", (e) => {
    drag = { x: (e as PointerEvent).clientX - tx, y: (e as PointerEvent).clientY - ty };
    frame.setPointerCapture((e as PointerEvent).pointerId);
  });
  frame.addEventListener("pointermove", (e) => {
    if (!drag) return;
    tx = (e as PointerEvent).clientX - drag.x; ty = (e as PointerEvent).clientY - drag.y;
    clamp(); apply();
  });
  frame.addEventListener("pointerup", () => { if (drag) { drag = null; save(); } });
  frame.addEventListener("wheel", (e) => { e.preventDefault(); setZoom(z * ((e as WheelEvent).deltaY < 0 ? 1.08 : 0.926)); }, { passive: false });
  ($("#zoom") as HTMLInputElement).addEventListener("input", (e) => setZoom(Number((e.target as HTMLInputElement).value)));
  $("#reset").onclick = () => { const a = (document.querySelector(".thumb.sel") as HTMLElement)?.dataset.f; if (a) choose(a); };
  $("#prev").onclick = () => load((cur - 1 + BIRDS.length) % BIRDS.length);
  $("#next").onclick = () => load((cur + 1) % BIRDS.length);

  /* ---- exportar / importar ---- */
  $("#export").onclick = () => {
    const blob = new Blob([JSON.stringify(sel, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "photo-selections.json"; a.click();
  };
  ($("#import") as HTMLInputElement).addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => { try { Object.assign(sel, JSON.parse(String(r.result))); load(cur); refreshList(); } catch { alert("JSON inválido"); } };
    r.readAsText(file);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "j") load((cur + 1) % BIRDS.length);
    if (e.key === "ArrowUp" || e.key === "k") load((cur - 1 + BIRDS.length) % BIRDS.length);
  });

  load(0);
  refreshList();
}

function page(birdsJson: string, preselectJson: string, aspect: number): string {
  const css = `
  :root{--forest:#15824c;--forest-deep:#0c5a36;--pine:#073d24;--mint:#8ed8c0;--mint-wash:#e4f3ec;--paper:#eef5ef;--ink:#143226;--ink-soft:#3a5547}
  *{box-sizing:border-box} body{margin:0;font:14px/1.4 system-ui,sans-serif;color:var(--ink);background:var(--paper);display:flex;flex-direction:column;height:100vh}
  header{display:flex;align-items:center;gap:16px;padding:12px 18px;background:var(--forest-deep);color:#fff}
  header h1{font-size:16px;margin:0;font-weight:700} header .sp{flex:1}
  #count{font-size:13px;color:var(--mint)}
  button,.btn{font:inherit;border:0;border-radius:8px;padding:8px 14px;background:var(--forest);color:#fff;cursor:pointer}
  button.ghost{background:rgba(255,255,255,.15)}
  main{flex:1;display:flex;min-height:0}
  #list{width:280px;overflow:auto;border-right:1px solid #d6e2d9;background:#fff}
  .bird{display:flex;align-items:center;gap:8px;padding:9px 14px;cursor:pointer;border-bottom:1px solid #eef3ef}
  .bird:hover{background:var(--mint-wash)} .bird.active{background:var(--mint-wash);box-shadow:inset 3px 0 0 var(--forest)}
  .bird .nm{flex:1} .bird .badge{color:var(--forest);font-weight:700}
  .bird.done .nm{color:var(--ink-soft)}
  #detail{flex:1;overflow:auto;padding:20px 24px}
  #detail h2{margin:0;font-size:22px} #sci{margin:.2em 0 14px;font-style:italic;color:var(--ink-soft)}
  #thumbs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
  .thumb{width:96px;height:75px;object-fit:cover;border-radius:7px;cursor:pointer;border:3px solid transparent}
  .thumb:hover{border-color:var(--mint)} .thumb.sel{border-color:var(--forest);box-shadow:0 0 0 2px var(--forest)}
  .empty{color:var(--ink-soft)}
  .editor{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
  #frame{width:${520}px;height:${Math.round(520 / aspect)}px;overflow:hidden;position:relative;border-radius:10px;background:#cfe0d6;cursor:grab;touch-action:none;box-shadow:inset 0 0 0 1px rgba(7,61,36,.2)}
  #frame:active{cursor:grabbing} .cropimg{position:absolute;left:0;top:0;user-select:none;-webkit-user-drag:none;max-width:none}
  .controls{display:flex;flex-direction:column;gap:12px;min-width:220px}
  .controls label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--forest)}
  .hint{font-size:12px;color:var(--ink-soft);max-width:240px}
  .nav{display:flex;gap:8px;margin-top:6px}
  input[type=range]{width:220px}
  `;
  const body = `
  <header>
    <h1>Selección de fotos — Catálogo de aves</h1>
    <span id="count"></span>
    <span class="sp"></span>
    <label class="btn ghost" style="cursor:pointer">Importar JSON<input id="import" type="file" accept="application/json" hidden></label>
    <button id="export">Exportar JSON</button>
  </header>
  <main>
    <div id="list"></div>
    <div id="detail">
      <h2 id="title"></h2><div id="sci"></div>
      <div id="thumbs"></div>
      <div class="editor">
        <div id="frame"></div>
        <div class="controls">
          <div><label>Zoom</label><br><input id="zoom" type="range" min="1" max="5" step="0.01" value="1"></div>
          <button id="reset" class="ghost">Centrar / reiniciar encuadre</button>
          <p class="hint">Marco con el aspecto real del catálogo (≈${aspect.toFixed(3)}:1). Arrastra para mover, rueda o el deslizador para acercar. Se guarda solo al soltar.</p>
          <div class="nav"><button id="prev" class="ghost">◀ Anterior</button><button id="next" class="ghost">Siguiente ▶</button></div>
        </div>
      </div>
    </div>
  </main>`;
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Selección de fotos · Catálogo de aves</title><style>${css}</style></head>
<body>${body}
<script>
/* shim de helpers que esbuild/tsx puede inyectar en la función serializada */
var __name=function(t){return t;};
const BIRDS=${birdsJson};const PRESELECT=${preselectJson};const ASPECT=${aspect};
(${client.toString()})();
</script></body></html>`;
}

main().catch((e) => { console.error("✗ Falló:", e); process.exit(1); });
