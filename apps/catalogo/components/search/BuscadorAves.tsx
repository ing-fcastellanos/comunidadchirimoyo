"use client";
/* BuscadorAves.tsx — contenedor cliente: estado de filtros, barra de resultados,
   pills de filtros activos, estado vacío y grid/lista. Portado del handoff
   docs/design/buscar-aves/.../searchapp.jsx. */
import { useMemo, useState } from "react";
import { Ico } from "./Icons";
import { SearchPanel } from "./SearchPanel";
import { EspecieCard } from "./EspecieCard";
import { CATS, SHAPES, SIZES, COLORS, WHERES } from "@/lib/dictionary";
import type { CategoriaId } from "@/lib/dictionary";
import { EMPTY_FILTERS, filterAndSort, type Especie, type Filters, type SortKey } from "@/lib/search";

const catLabel = (id: CategoriaId) => CATS[id].label;

const GROUP_NAME: Record<string, string> = {
  shapes: "Forma", sizes: "Tamaño", colors: "Color", wheres: "Hábitat",
  categorias: "Categoría", ordenes: "Orden", familias: "Familia",
  presencias: "Presencia", observaciones: "Observación", conservaciones: "Conservación",
};

function labelFor(key: string, val: string): string {
  switch (key) {
    case "shapes": return SHAPES.find((s) => s.id === val)?.label ?? val;
    case "sizes": return SIZES.find((s) => s.id === val)?.label ?? val;
    case "colors": return COLORS.find((s) => s.id === val)?.label ?? val;
    case "wheres": return WHERES.find((s) => s.id === val)?.label ?? val;
    case "categorias": return CATS[val as CategoriaId]?.label ?? val;
    case "conservaciones": return val === "NOM-059" ? "Protección NOM-059" : val;
    default: return val;
  }
}

const PILL_KEYS: (keyof Filters)[] = [
  "shapes", "sizes", "colors", "wheres", "categorias", "ordenes", "familias", "presencias", "observaciones", "conservaciones",
];

function ResultsBar({ found, sort, setSort, view, setView }: { found: number; sort: SortKey; setSort: (s: SortKey) => void; view: "grid" | "list"; setView: (v: "grid" | "list") => void }) {
  return (
    <div className="sticky top-0 z-20 -mx-6 border-y border-forest/10 bg-paper/85 px-6 py-3 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[16px] font-semibold text-forest-deep">{found} {found === 1 ? "ave encontrada" : "aves encontradas"}</span>
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

function EmptyState({ clearAll }: { clearAll: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-paper-card px-6 py-20 text-center shadow-card ring-1 ring-forest/[0.07]">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-mint-wash text-forest-deep/70"><Ico name="binoculars" className="h-10 w-10" sw={1.7} /></span>
      <h3 className="mt-5 font-serif text-[26px] font-semibold leading-[1.15] text-forest-deep">No encontramos aves con esos rasgos</h3>
      <p className="mt-2 max-w-sm text-[16px] leading-relaxed text-ink/70">Prueba quitando un filtro o ampliando el color y el tamaño.</p>
      <button type="button" onClick={clearAll} className="mt-6 inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-forest px-5 py-2.5 text-[14px] font-semibold text-paper transition-colors hover:bg-forest-deep">
        <Ico name="x" className="h-4 w-4" /> Limpiar filtros
      </button>
    </div>
  );
}

export function BuscadorAves({ especies }: { especies: Especie[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [openSection, setOpenSection] = useState<"detailed" | "quick" | null>("detailed");
  const [sort, setSort] = useState<SortKey>("relevancia");
  const [view, setView] = useState<"grid" | "list">("grid");

  const setText = (v: string) => setFilters((f) => ({ ...f, text: v }));
  const toggleVal = (key: keyof Filters, val: string) =>
    setFilters((f) => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  const setOne = (key: keyof Filters, val: string) => setFilters((f) => ({ ...f, [key]: val ? [val] : [] }));
  const clearAll = () => setFilters(EMPTY_FILTERS);
  const applyQuick = (patch: Record<string, unknown>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setOpenSection("detailed");
  };

  const results = useMemo(() => filterAndSort(especies, filters, sort, catLabel), [especies, filters, sort]);

  const pills: { k: string; group?: string; label: string; remove: () => void }[] = [];
  if (filters.text.trim()) pills.push({ k: "text", label: `"${filters.text.trim()}"`, remove: () => setText("") });
  PILL_KEYS.forEach((key) => {
    (filters[key] as string[]).forEach((val) =>
      pills.push({ k: key + val, group: GROUP_NAME[key], label: labelFor(key, val), remove: () => toggleVal(key, val) }),
    );
  });
  if (filters.featured) pills.push({ k: "featured", label: "Destacadas del autor", remove: () => setFilters((f) => ({ ...f, featured: false })) });

  return (
    <>
      <div className="py-7 sm:py-9">
        <SearchPanel
          filters={filters} especies={especies} setText={setText} toggleVal={toggleVal} setOne={setOne}
          count={results.length} clearAll={clearAll} applyQuick={applyQuick}
          openSection={openSection} setOpenSection={setOpenSection}
        />
      </div>

      <ResultsBar found={results.length} sort={sort} setSort={setSort} view={view} setView={setView} />

      {pills.length > 0 && (
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
      )}

      {results.length === 0 ? (
        <EmptyState clearAll={clearAll} />
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
          {results.map((b) => <EspecieCard key={b.id} bird={b} view={view} />)}
        </div>
      )}
    </>
  );
}
