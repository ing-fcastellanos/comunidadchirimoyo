"use client";
/* shared.tsx — piezas comunes a los buscadores (aves especializado y general):
   barra de resultados, estado vacío, bloque de filtros activos y los helpers de
   etiqueta de pill. Lo aviar-específico (forma/talla/dónde/gremios) vive en
   SearchPanel; aquí solo lo transversal. Ver #85. */
import { Ico } from "./Icons";
import { CATS, SHAPES, SIZES, COLORS, WHERES } from "@/lib/dictionary";
import type { CategoriaId } from "@/lib/dictionary";
import { GRUPO_LABEL } from "@/lib/fauna-schema";
import type { SortKey } from "@/lib/search";

export const catLabel = (id: CategoriaId) => CATS[id].label;

/** Nombre legible del grupo de un pill (la clave de Filters → etiqueta). */
export const GROUP_NAME: Record<string, string> = {
  grupos: "Grupo",
  shapes: "Forma", sizes: "Tamaño", colors: "Color", wheres: "Hábitat",
  categorias: "Categoría", ordenes: "Orden", familias: "Familia",
  presencias: "Presencia", observaciones: "Observación", conservaciones: "Conservación",
};

/** Etiqueta legible de un valor de filtro según su clave. */
export function labelFor(key: string, val: string): string {
  switch (key) {
    case "grupos": return GRUPO_LABEL[val as keyof typeof GRUPO_LABEL] ?? val;
    case "shapes": return SHAPES.find((s) => s.id === val)?.label ?? val;
    case "sizes": return SIZES.find((s) => s.id === val)?.label ?? val;
    case "colors": return COLORS.find((s) => s.id === val)?.label ?? val;
    case "wheres": return WHERES.find((s) => s.id === val)?.label ?? val;
    case "categorias": return CATS[val as CategoriaId]?.label ?? val;
    case "conservaciones": return val === "NOM-059" ? "Protección NOM-059" : val;
    default: return val;
  }
}

export interface Pill {
  k: string;
  group?: string;
  label: string;
  remove: () => void;
}

/** Sustantivo del contador de resultados (singular/plural). */
export interface ResultNoun {
  one: string;
  many: string;
}

export function ResultsBar({ found, noun, sort, setSort, view, setView }: {
  found: number; noun: ResultNoun; sort: SortKey; setSort: (s: SortKey) => void;
  view: "grid" | "list"; setView: (v: "grid" | "list") => void;
}) {
  return (
    <div className="sticky top-0 z-20 -mx-6 border-y border-forest/10 bg-paper/85 px-6 py-3 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[16px] font-semibold text-forest-deep">{found} {found === 1 ? noun.one : noun.many}</span>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Ordenar resultados" className="appearance-none rounded-xl bg-paper-card py-2 pl-3.5 pr-9 text-[13px] font-semibold text-ink ring-1 ring-inset ring-forest/15 focus:outline-none focus:ring-2 focus:ring-forest">
              <option value="relevancia">Relevancia</option>
              <option value="alfabetico">Alfabético</option>
              <option value="categoria">Por categoría</option>
              <option value="comun-rara">De más común a más rara</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-forest"><Ico name="chevron-down" className="h-4 w-4" /></span>
          </div>
          <div className="flex rounded-xl bg-paper-card p-1 ring-1 ring-inset ring-forest/15">
            {(["grid", "list"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setView(v)} aria-label={v === "grid" ? "Vista de cuadrícula" : "Vista de lista"} aria-pressed={view === v}
                className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${view === v ? "bg-forest text-paper" : "text-forest hover:bg-mint-wash"}`}>
                <Ico name={v} className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, subtitle, clearAll }: { title: string; subtitle: string; clearAll: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-paper-card px-6 py-20 text-center shadow-card ring-1 ring-forest/[0.07]">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-mint-wash text-forest-deep/70"><Ico name="binoculars" className="h-10 w-10" sw={1.7} /></span>
      <h3 className="mt-5 font-serif text-[26px] font-semibold leading-[1.15] text-forest-deep">{title}</h3>
      <p className="mt-2 max-w-sm text-[16px] leading-relaxed text-ink/70">{subtitle}</p>
      <button type="button" onClick={clearAll} className="mt-6 inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-forest px-5 py-2.5 text-[14px] font-semibold text-paper transition-colors hover:bg-forest-deep">
        <Ico name="x" className="h-4 w-4" /> Limpiar filtros
      </button>
    </div>
  );
}

/** Bloque de filtros activos (pills) + "Limpiar todo". */
export function ActiveFilters({ pills, clearAll }: { pills: Pill[]; clearAll: () => void }) {
  if (pills.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 py-5">
      <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-forest/60">Filtros activos</span>
      {pills.map((p) => (
        <button key={p.k} type="button" onClick={p.remove} className="group inline-flex items-center gap-1.5 rounded-full bg-mint-soft py-1.5 pl-3 pr-2 text-[13px] font-semibold text-forest-deep ring-1 ring-inset ring-forest/15 transition-colors hover:bg-mint">
          {p.group && <span className="text-forest/55">{p.group}:</span>} {p.label}
          <span className="grid h-4 w-4 place-items-center rounded-full bg-forest/15 transition-colors group-hover:bg-forest/30"><Ico name="x" className="h-3 w-3" sw={2.5} /></span>
        </button>
      ))}
      <button type="button" onClick={clearAll} className="ml-1 text-[13px] font-semibold text-forest underline-offset-2 hover:underline">Limpiar todo</button>
    </div>
  );
}
