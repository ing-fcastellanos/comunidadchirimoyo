/* fauna-validate.ts — validación del esquema de ficha de fauna (#91). Módulo
   PURO (sin node:fs/path): la lógica de validación vive ÚNICAMENTE aquí y la
   reusan tanto el loader de build (content.ts, que filtra severidad="error" y
   lanza) como el script de reporte (scripts/validar-fichas.mts, que acumula
   todo). No dupliques estas reglas en otro lado. Ver esquema-ficha-fauna. */
import type {
  Grupo,
  EstatusMigratorio,
  GradoOcurrencia,
  EstatusDistribucion,
  Nom059,
  Forma,
  Tamano,
  Color,
  Donde,
} from "./fauna-schema";

export type Severidad = "error" | "warning";

export interface Problema {
  /** Campo o regla afectada (p. ej. "genero", "categoria", "fotos[0].credito"). */
  campo: string;
  mensaje: string;
  severidad: Severidad;
}

/** Contexto que una ficha aislada no conoce: lo arma el caller mientras itera. */
export interface ValidarCtx {
  /** Nombre de la carpeta de la ficha (autoridad de slug y grupo). */
  slugCarpeta: string;
  /** Grupo derivado de la carpeta (autoridad para `categoria` group-aware). */
  grupo: Grupo;
  /** Slugs ya vistos en el catálogo; el caller agrega tras validar (unicidad). */
  slugsVistos: Set<string>;
  /** `archivo` de la foto curada en photo-selections.json para este slug, si hay. */
  seleccionCurada?: string;
}

/* ---- Vocabularios cerrados (fuente única; reflejan fauna-schema.ts) ---- */

export const GRUPOS_VALIDOS: readonly Grupo[] = ["aves", "anfibios", "reptiles"];

/** Vocabulario de `categoria` según el `grupo` (group-aware, ADR-0024). */
export const CATEGORIAS_POR_GRUPO: Record<Grupo, readonly string[]> = {
  aves: ["Vadeadoras", "Nadadoras", "Playeras", "Voladoras", "Rapaces y Carroñeras", "Terrestres"],
  anfibios: ["Anuros", "Salamandras"],
  reptiles: ["Lagartijas", "Serpientes", "Tortugas"],
};

const ESTATUS_MIGRATORIO: readonly EstatusMigratorio[] = [
  "residente",
  "migratoria-invierno",
  "migratoria-verano",
  "transitoria",
];
const GRADO_OCURRENCIA: readonly GradoOcurrencia[] = ["comun", "poco-comun", "rara"];
const ESTATUS_DISTRIBUCION: readonly EstatusDistribucion[] = ["nativa", "introducida"];
const NOM059: readonly Nom059[] = ["pr", "a", "p", "e", "ninguno"];

const FORMAS: readonly Forma[] = ["pato", "garza", "gallineta", "buceador", "playera", "rapaz", "pajaro"];
const TAMANOS: readonly Tamano[] = ["muy-chica", "chica", "mediana", "grande", "muy-grande"];
const COLORES: readonly Color[] = [
  "blanco", "negro", "cafe", "gris", "azul", "verde", "amarillo", "rojo", "naranja", "iridiscente",
];
const DONDES: readonly Donde[] = ["nadando", "orilla", "volando", "arbol", "suelo", "poste"];

/* ---- Helpers puros ---- */

const esStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

/** Nombre de archivo sin directorio ni extensión, en minúsculas (match por stem). */
function stem(archivo: string): string {
  const base = archivo.split(/[\\/]/).pop() ?? archivo;
  const punto = base.lastIndexOf(".");
  return (punto > 0 ? base.slice(0, punto) : base).toLowerCase();
}

/**
 * Valida una ficha contra el esquema. Devuelve TODOS sus problemas (no aborta
 * al primero). El caller decide qué hacer con la severidad: el loader filtra
 * `error` y lanza; el script acumula y reporta todo.
 */
export function validarFicha(
  data: Record<string, unknown>,
  cuerpo: string,
  ctx: ValidarCtx,
): Problema[] {
  const problemas: Problema[] = [];
  const err = (campo: string, mensaje: string) =>
    problemas.push({ campo, mensaje, severidad: "error" });
  const warn = (campo: string, mensaje: string) =>
    problemas.push({ campo, mensaje, severidad: "warning" });

  const enEnum = <T extends string>(v: unknown, valores: readonly T[]) =>
    typeof v === "string" && (valores as readonly string[]).includes(v);

  // --- Núcleo: campos string obligatorios ---
  const reqStr: Array<[keyof typeof data & string, string]> = [
    ["nombreComun", "nombreComun"],
    ["nombreCientifico", "nombreCientifico"],
    ["categoria", "categoria"],
    ["orden", "orden"],
    ["familia", "familia"],
    ["genero", "genero"],
    ["estatusMigratorio", "estatusMigratorio"],
    ["gradoOcurrencia", "gradoOcurrencia"],
    ["estatusDistribucion", "estatusDistribucion"],
  ];
  for (const [campo, etiqueta] of reqStr) {
    if (!esStr(data[campo])) err(etiqueta, `falta o vacío: ${etiqueta}`);
  }

  // --- Conservación ---
  const conservacion = data.conservacion;
  if (typeof conservacion !== "object" || conservacion === null) {
    err("conservacion", "falta el objeto conservacion");
  } else {
    const nom059 = (conservacion as Record<string, unknown>).nom059;
    if (!esStr(nom059)) err("conservacion.nom059", "falta conservacion.nom059");
    else if (!enEnum(nom059, NOM059))
      err("conservacion.nom059", `valor fuera del enum NOM-059: "${String(nom059)}"`);
  }

  // --- Fuentes y fotos (mínimos) ---
  if (!Array.isArray(data.fuentes) || data.fuentes.length < 1)
    err("fuentes", "se requiere al menos una fuente");

  const fotos = data.fotos;
  if (!Array.isArray(fotos) || fotos.length < 1) {
    err("fotos", "se requiere al menos una foto");
  } else {
    fotos.forEach((f, i) => {
      const foto = f as Record<string, unknown>;
      if (!esStr(foto?.credito)) err(`fotos[${i}].credito`, "falta crédito de la foto");
      if (!esStr(foto?.alt)) err(`fotos[${i}].alt`, "falta texto alternativo (alt) de la foto");
    });
  }

  // --- Cuerpo: ## Descripción presente ---
  if (!/^##\s+Descripci[oó]n\s*$/im.test(cuerpo))
    err("## Descripción", "el cuerpo no tiene la sección ## Descripción");

  // --- Enums ---
  if (esStr(data.estatusMigratorio) && !enEnum(data.estatusMigratorio, ESTATUS_MIGRATORIO))
    err("estatusMigratorio", `valor fuera del enum: "${String(data.estatusMigratorio)}"`);
  if (esStr(data.gradoOcurrencia) && !enEnum(data.gradoOcurrencia, GRADO_OCURRENCIA))
    err("gradoOcurrencia", `valor fuera del enum: "${String(data.gradoOcurrencia)}"`);
  if (esStr(data.estatusDistribucion) && !enEnum(data.estatusDistribucion, ESTATUS_DISTRIBUCION))
    err("estatusDistribucion", `valor fuera del enum: "${String(data.estatusDistribucion)}"`);

  // --- Grupo: enum + coincide con la carpeta (autoridad) ---
  if (data.grupo !== undefined) {
    if (!enEnum(data.grupo, GRUPOS_VALIDOS))
      err("grupo", `valor fuera del enum aves|anfibios|reptiles: "${String(data.grupo)}"`);
    else if (data.grupo !== ctx.grupo)
      err("grupo", `grupo "${String(data.grupo)}" no coincide con la carpeta "${ctx.grupo}"`);
  }

  // --- categoria group-aware (la carpeta es la autoridad del grupo) ---
  if (esStr(data.categoria)) {
    const vocab = CATEGORIAS_POR_GRUPO[ctx.grupo];
    if (!vocab.includes(data.categoria as string))
      err(
        "categoria",
        `"${String(data.categoria)}" no es válida para grupo ${ctx.grupo} (esperado: ${vocab.join(" | ")})`,
      );
  }

  // --- Slug: coincide con la carpeta + unicidad ---
  const slug = esStr(data.slug) ? (data.slug as string) : ctx.slugCarpeta;
  if (slug !== ctx.slugCarpeta)
    err("slug", `el slug "${slug}" no coincide con el nombre de la carpeta "${ctx.slugCarpeta}"`);
  if (ctx.slugsVistos.has(slug))
    err("slug", `slug duplicado en el catálogo: "${slug}"`);

  // --- temporada.meses ∈ 1–12 ---
  const temporada = data.temporada as { meses?: unknown } | undefined;
  if (temporada && Array.isArray(temporada.meses)) {
    for (const m of temporada.meses) {
      if (typeof m !== "number" || !Number.isInteger(m) || m < 1 || m > 12) {
        err("temporada.meses", `mes fuera de rango 1–12: ${JSON.stringify(m)}`);
      }
    }
  }

  // --- Vocabularios visuales cerrados (solo si están presentes) ---
  if (data.forma !== undefined && !enEnum(data.forma, FORMAS))
    err("forma", `valor fuera de la lista cerrada: "${String(data.forma)}"`);
  if (data.tamano !== undefined && !enEnum(data.tamano, TAMANOS))
    err("tamano", `valor fuera de la lista cerrada: "${String(data.tamano)}"`);
  if (data.donde !== undefined && !enEnum(data.donde, DONDES))
    err("donde", `valor fuera de la lista cerrada: "${String(data.donde)}"`);
  if (data.colores !== undefined) {
    if (!Array.isArray(data.colores))
      err("colores", "colores debe ser una lista");
    else
      for (const c of data.colores)
        if (!enEnum(c, COLORES)) err("colores", `color fuera de la lista cerrada: "${String(c)}"`);
  }

  // --- WARNING: portada == foto curada (match por stem) ---
  if (ctx.seleccionCurada && Array.isArray(fotos) && fotos.length > 0) {
    const portada = (fotos[0] as Record<string, unknown>)?.archivo;
    if (esStr(portada) && stem(portada as string) !== stem(ctx.seleccionCurada)) {
      warn(
        "fotos[0]",
        `la portada "${String(portada)}" no es la foto curada "${ctx.seleccionCurada}" (photo-selections.json)`,
      );
    }
  }

  return problemas;
}
