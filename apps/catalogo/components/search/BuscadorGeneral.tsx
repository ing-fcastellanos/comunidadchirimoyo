"use client";
/* BuscadorGeneral.tsx — buscador GENERAL de /busqueda: sobre los 3 grupos, con
   el panel del núcleo común (PanelGeneral). Reusa la maquinaria transversal de
   ./shared (filtros activos, barra de resultados, estado vacío) y la card. No
   toca el buscador especializado de aves. Ver #85. */
import { useMemo, useState } from "react";
import { PanelGeneral } from "./PanelGeneral";
import { EspecieCard } from "./EspecieCard";
import { ResultsBar, EmptyState, ActiveFilters, GROUP_NAME, labelFor, catLabel, type Pill } from "./shared";
import { EMPTY_FILTERS, filterAndSort, type Especie, type Filters, type SortKey } from "@/lib/search";

/** Solo las facetas del núcleo común se muestran como pills. */
const PILL_KEYS: (keyof Filters)[] = ["grupos", "ordenes", "familias", "presencias", "conservaciones", "observaciones"];

export function BuscadorGeneral({ especies }: { especies: Especie[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("relevancia");
  const [view, setView] = useState<"grid" | "list">("grid");

  const setText = (v: string) => setFilters((f) => ({ ...f, text: v }));
  const toggleVal = (key: keyof Filters, val: string) =>
    setFilters((f) => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  const setOne = (key: keyof Filters, val: string) => setFilters((f) => ({ ...f, [key]: val ? [val] : [] }));
  const setMany = (key: keyof Filters, vals: string[]) => setFilters((f) => ({ ...f, [key]: vals }));
  const clearAll = () => setFilters(EMPTY_FILTERS);

  const results = useMemo(() => filterAndSort(especies, filters, sort, catLabel), [especies, filters, sort]);

  const pills: Pill[] = [];
  if (filters.text.trim()) pills.push({ k: "text", label: `"${filters.text.trim()}"`, remove: () => setText("") });
  PILL_KEYS.forEach((key) => {
    (filters[key] as string[]).forEach((val) =>
      pills.push({ k: key + val, group: GROUP_NAME[key], label: labelFor(key, val), remove: () => toggleVal(key, val) }),
    );
  });

  return (
    <>
      <div className="py-7 sm:py-9">
        <PanelGeneral filters={filters} especies={especies} setText={setText} toggleVal={toggleVal} setOne={setOne} setMany={setMany} />
      </div>

      <ResultsBar found={results.length} noun={{ one: "especie encontrada", many: "especies encontradas" }} sort={sort} setSort={setSort} view={view} setView={setView} />

      <ActiveFilters pills={pills} clearAll={clearAll} />

      {results.length === 0 ? (
        <EmptyState title="No encontramos especies con esos filtros" subtitle="Prueba quitando un filtro o ampliando la búsqueda." clearAll={clearAll} />
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
          {results.map((b) => <EspecieCard key={b.id} bird={b} view={view} />)}
        </div>
      )}
    </>
  );
}
