/* seed-firestore.mts — migración one-shot de content/ a Firestore (Fase 6, #135).
   "Leer con los loaders viejos, escribir en Firestore": reusa getNoticia/getJornadas
   (cero drift de mapeo, incluido el `fecha` que YAML parsea como Date) y escribe con
   lib/firestore.ts. Determinista e idempotente: los timestamps de las noticias se
   derivan de `fecha`, no del reloj. Ver ADR-0028 y la capability `contenido-dinamico`.

   Uso:
     npm run seed:firestore -- --emulator            # seed contra el emulator (dev)
     npm run seed:firestore -- --emulator --verify   # verificación de paridad (sin escribir)
     npm run seed:firestore                           # seed contra PROD (ADC) — migración real, manual
*/
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { Timestamp } from "firebase-admin/firestore";

const useEmulator = process.argv.includes("--emulator");
const verifyOnly = process.argv.includes("--verify");
// Debe fijarse ANTES de que getDb() inicialice el cliente (init lazy en lib/firestore.ts).
if (useEmulator && !process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8085";
}

// Imports que tocan el cliente van después de fijar el emulator host.
const { getDb } = await import("../lib/firestore.ts");
const { NOTICIAS_DIR, getNoticia, getAllNoticias } = await import("../lib/noticias.ts");
const { getJornadas } = await import("../lib/jornadas.ts");
const { getAllNoticiasDb } = await import("../lib/noticias-db.ts");
const { getJornadasDb } = await import("../lib/jornadas-db.ts");

const destino = process.env.FIRESTORE_EMULATOR_HOST
  ? `emulator ${process.env.FIRESTORE_EMULATOR_HOST}`
  : "PROD (ADC)";

/** Lista los slugs de noticias (ignora `_*` y README, como el loader). */
async function slugsNoticias(): Promise<string[]> {
  const entradas = await readdir(NOTICIAS_DIR);
  return entradas
    .filter((n) => n.endsWith(".md") && !n.startsWith("_") && n !== "README.md")
    .map((n) => n.replace(/\.md$/, ""));
}

/** `portada` cruda (ruta relativa) del frontmatter: se guarda sin resolver para
    que el reader aplique mediaUrl() y `NEXT_PUBLIC_COMUNIDAD_CDN_BASE` siga
    mandando (getNoticia ya la resolvió a URL absoluta; aquí queremos la cruda). */
async function portadaCruda(slug: string): Promise<string | null> {
  const { data } = matter(await readFile(path.join(NOTICIAS_DIR, `${slug}.md`), "utf8"));
  return typeof data.portada === "string" && data.portada.trim() ? data.portada.trim() : null;
}

async function seedNoticias(): Promise<number> {
  const db = getDb();
  let n = 0;
  for (const slug of await slugsNoticias()) {
    const nota = await getNoticia(slug); // reusa el mapeo (fecha/estado/tags/cuerpo)
    if (!nota) continue;
    const fechaTs = nota.fecha ? Timestamp.fromDate(new Date(nota.fecha)) : null;
    await db.collection("noticias").doc(slug).set({
      titulo: nota.titulo,
      slug: nota.slug,
      fecha: nota.fecha,
      resumen: nota.resumen,
      autor: nota.autor,
      portada: await portadaCruda(slug),
      portadaAlt: nota.portadaAlt,
      estado: nota.estado,
      tags: nota.tags,
      cuerpo: nota.cuerpo,
      // Timestamps derivados de `fecha` (deterministas → idempotencia real).
      createdAt: fechaTs,
      updatedAt: fechaTs,
      publishedAt: nota.estado === "publicado" ? fechaTs : null,
    });
    n++;
  }
  return n;
}

async function seedJornadas(): Promise<number> {
  const db = getDb();
  const { recurrentes = [], eventos = [] } = await getJornadas();
  let n = 0;
  for (const r of recurrentes) {
    await db.collection("jornadas").doc(r.slug).set({
      kind: "recurrente",
      slug: r.slug,
      titulo: r.titulo,
      tipo: r.tipo,
      hora: r.hora,
      lugar: r.lugar ?? null,
      inscripcion: r.inscripcion ?? true,
      descripcion: r.descripcion ?? null,
      recurrencia: r.recurrencia,
    });
    n++;
  }
  for (const e of eventos) {
    await db.collection("jornadas").doc(e.slug).set({
      kind: "evento",
      slug: e.slug,
      titulo: e.titulo,
      tipo: e.tipo,
      hora: e.hora,
      lugar: e.lugar ?? null,
      inscripcion: e.inscripcion ?? true,
      descripcion: e.descripcion ?? null,
      fecha: e.fecha,
    });
    n++;
  }
  return n;
}

/** Compara los loaders fs contra los db-readers. Devuelve la lista de divergencias. */
async function verificarParidad(): Promise<string[]> {
  const fallos: string[] = [];

  const clave = (x: { slug: string; titulo: string; estado: string }) => `${x.slug}|${x.titulo}|${x.estado}`;
  const fsN = (await getAllNoticias()).map(clave).sort();
  const dbN = (await getAllNoticiasDb()).map(clave).sort();
  if (fsN.length !== dbN.length) fallos.push(`noticias: fs=${fsN.length} vs db=${dbN.length}`);
  fsN.forEach((k, i) => { if (k !== dbN[i]) fallos.push(`noticia divergente: "${k}" vs "${dbN[i] ?? "—"}"`); });

  const fsJ = await getJornadas();
  const dbJ = await getJornadasDb();
  const cuenta = (j: { recurrentes?: unknown[]; eventos?: unknown[] }) =>
    `rec=${(j.recurrentes ?? []).length} ev=${(j.eventos ?? []).length}`;
  if (cuenta(fsJ) !== cuenta(dbJ)) fallos.push(`jornadas: fs(${cuenta(fsJ)}) vs db(${cuenta(dbJ)})`);
  const slugsFs = [...(fsJ.recurrentes ?? []), ...(fsJ.eventos ?? [])].map((x) => x.slug).sort();
  const slugsDb = [...(dbJ.recurrentes ?? []), ...(dbJ.eventos ?? [])].map((x) => x.slug).sort();
  if (slugsFs.join(",") !== slugsDb.join(",")) fallos.push(`jornadas slugs: [${slugsFs}] vs [${slugsDb}]`);

  return fallos;
}

async function main() {
  if (verifyOnly) {
    console.log(`seed-firestore · verificar paridad · ${destino}`);
    const fallos = await verificarParidad();
    if (fallos.length) {
      console.error("  ✗ paridad FALLÓ:");
      fallos.forEach((f) => console.error(`    - ${f}`));
      process.exit(1);
    }
    console.log("  ✓ paridad OK — Firestore coincide con los archivos");
    return;
  }

  console.log(`seed-firestore · sembrar · ${destino}`);
  const nN = await seedNoticias();
  const nJ = await seedJornadas();
  console.log(`  ✓ noticias: ${nN} · jornadas: ${nJ} sembradas`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("  ✗ seed-firestore falló:", e.message);
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      console.error("    (prod: revisa ADC y el rol roles/datastore.user en el SA)");
    }
    process.exit(1);
  });
