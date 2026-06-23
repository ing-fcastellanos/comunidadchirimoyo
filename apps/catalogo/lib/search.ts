/* search.ts — view-model de búsqueda. Convierte FichaEspecie (esquema #9) en el
   registro `Bird` que consumen los componentes del buscador, y contiene el
   filtrado + orden en cliente (portado del handoff searchapp.jsx). */
import { fotoUrl, type FichaEspecie, type Grupo, type Forma, type Tamano, type Color, type Donde } from "./fauna-schema";
import type { CategoriaId, Presencia, Observacion, Conservacion } from "./dictionary";

export interface Bird {
  id: string;
  /** Grupo taxonómico (aves | anfibios | reptiles); base del filtro por grupo (#85). */
  group: Grupo;
  common: string;
  sci: string;
  orden: string;
  familia: string;
  category: CategoriaId;
  shape?: Forma;
  size?: Tamano;
  colors: Color[];
  where?: Donde;
  presence: Presencia;
  observation: Observacion;
  conservation: Conservacion;
  featured: boolean;
  img: string | null;
  href: string;
  desc: string;
  keywords: string;
}

const CATEGORIA_ID: Record<string, CategoriaId> = {
  // aves (gremio ecológico)
  Vadeadoras: "vadeadoras",
  Nadadoras: "nadadoras",
  Playeras: "playeras",
  Voladoras: "voladoras",
  "Rapaces y Carroñeras": "rapaces",
  Terrestres: "terrestres",
  // anfibios / reptiles (clase taxonómica)
  Anuros: "anuros",
  Salamandras: "salamandras",
  Lagartijas: "lagartijas",
  Serpientes: "serpientes",
  Tortugas: "tortugas",
};
const OBS: Record<FichaEspecie["gradoOcurrencia"], Observacion> = {
  comun: "Común",
  "poco-comun": "Poco Común",
  rara: "Raro",
};

function presenciaDe(f: FichaEspecie): Presencia {
  if (f.estatusDistribucion === "introducida") return "Introducida";
  return f.estatusMigratorio === "residente" ? "Residente" : "Migratoria";
}

/** Primera oración de la sección `## Descripción` del cuerpo. */
function resumen(cuerpo: string): string {
  const m = cuerpo.match(/##\s+Descripci[oó]n\s*\n+([^\n]+)/i);
  const parrafo = (m?.[1] ?? "").trim();
  const fin = parrafo.indexOf(". ");
  return fin > 0 ? parrafo.slice(0, fin + 1) : parrafo;
}

export function fichaToBird(f: FichaEspecie): Bird {
  return {
    id: f.slug,
    group: f.grupo,
    common: f.nombreComun,
    sci: f.nombreCientifico,
    orden: f.orden,
    familia: f.familia,
    category: CATEGORIA_ID[f.categoria] ?? "terrestres",
    shape: f.forma,
    size: f.tamano,
    colors: f.colores ?? [],
    where: f.donde,
    presence: presenciaDe(f),
    observation: OBS[f.gradoOcurrencia],
    conservation: f.conservacion.nom059 !== "ninguno" ? "NOM-059" : "Sin Amenaza",
    featured: Boolean(f.featured),
    img: f.fotos[0] ? fotoUrl(f.slug, f.fotos[0].archivo, "thumb") : null,
    href: `/${f.grupo}/${f.slug}`,
    desc: resumen(f.cuerpo),
    keywords: [f.nombreComun, f.nombreCientifico, f.familia, f.orden, ...(f.colores ?? [])]
      .join(" ")
      .toLowerCase(),
  };
}

export interface Filters {
  text: string;
  shapes: string[];
  sizes: string[];
  colors: string[];
  wheres: string[];
  categorias: string[];
  ordenes: string[];
  familias: string[];
  presencias: string[];
  observaciones: string[];
  conservaciones: string[];
  featured: boolean;
}

export const EMPTY_FILTERS: Filters = {
  text: "", shapes: [], sizes: [], colors: [], wheres: [],
  categorias: [], ordenes: [], familias: [], presencias: [], observaciones: [], conservaciones: [],
  featured: false,
};

export type SortKey = "relevancia" | "alfabetico" | "categoria" | "comun-rara";
const OBS_ORDER: Record<Observacion, number> = { Común: 0, "Poco Común": 1, Raro: 2 };

/** Filtra y ordena el catálogo según los filtros activos (en cliente). */
export function filterAndSort(
  birds: Bird[],
  f: Filters,
  sort: SortKey,
  catLabel: (id: CategoriaId) => string,
): Bird[] {
  const q = f.text.trim().toLowerCase();
  const arrOk = (arr: string[], val?: string) => arr.length === 0 || (val != null && arr.includes(val));
  let list = birds.filter((b) => {
    if (q && !(b.common + " " + b.sci + " " + b.familia + " " + b.orden + " " + b.keywords).toLowerCase().includes(q)) return false;
    if (!arrOk(f.shapes, b.shape)) return false;
    if (!arrOk(f.sizes, b.size)) return false;
    if (f.colors.length && !f.colors.some((c) => b.colors.includes(c as Color))) return false;
    if (!arrOk(f.wheres, b.where)) return false;
    if (!arrOk(f.categorias, b.category)) return false;
    if (!arrOk(f.ordenes, b.orden)) return false;
    if (!arrOk(f.familias, b.familia)) return false;
    if (!arrOk(f.presencias, b.presence)) return false;
    if (!arrOk(f.observaciones, b.observation)) return false;
    if (!arrOk(f.conservaciones, b.conservation)) return false;
    if (f.featured && !b.featured) return false;
    return true;
  });

  const cmp: Record<string, (a: Bird, b: Bird) => number> = {
    alfabetico: (a, b) => a.common.localeCompare(b.common, "es"),
    categoria: (a, b) => catLabel(a.category).localeCompare(catLabel(b.category), "es") || a.common.localeCompare(b.common, "es"),
    "comun-rara": (a, b) => OBS_ORDER[a.observation] - OBS_ORDER[b.observation] || a.common.localeCompare(b.common, "es"),
  };
  if (cmp[sort]) list = [...list].sort(cmp[sort]);
  return list;
}
