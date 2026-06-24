"use client";
/* PanelGeneral.tsx — panel del buscador GENERAL (/busqueda): solo el núcleo
   común del esquema (texto · grupo · orden · familia · presencia · conservación
   · ocurrencia). Sin filtros aviares (forma/talla/color/dónde/gremios). La
   faceta de grupo lleva un atajo «Herpetofauna» (anfibios + reptiles). Ver #85. */
import { Autocomplete, Chip } from "./SearchPanel";
import { Ico } from "./Icons";
import { GRUPO_LABEL, type Grupo } from "@/lib/fauna-schema";
import type { Especie, Filters } from "@/lib/search";

const GRUPOS: Grupo[] = ["aves", "anfibios", "reptiles"];
const HERPETOFAUNA: Grupo[] = ["anfibios", "reptiles"];

interface Props {
  filters: Filters;
  especies: Especie[];
  setText: (v: string) => void;
  toggleVal: (key: keyof Filters, val: string) => void;
  setOne: (key: keyof Filters, val: string) => void;
  setMany: (key: keyof Filters, vals: string[]) => void;
}

export function PanelGeneral({ filters, especies, setText, toggleVal, setOne, setMany }: Props) {
  const ordenes = [...new Set(especies.map((b) => b.orden))].sort();
  const familias = [...new Set(especies.map((b) => b.familia))].sort();
  const selects: { key: keyof Filters; label: string; options: [string, string][] }[] = [
    { key: "ordenes", label: "Orden", options: ordenes.map((o) => [o, o]) },
    { key: "familias", label: "Familia", options: familias.map((f) => [f, f]) },
    { key: "presencias", label: "Presencia", options: [["Residente", "Residente"], ["Migratoria", "Migratoria"], ["Introducida", "Introducida"]] },
    { key: "conservaciones", label: "Conservación", options: [["NOM-059", "Protección NOM-059"], ["Sin Amenaza", "Sin amenaza"]] },
    { key: "observaciones", label: "Ocurrencia", options: [["Común", "Común"], ["Poco Común", "Poco común"], ["Raro", "Raro"]] },
  ];

  const herpeActivo = HERPETOFAUNA.every((g) => filters.grupos.includes(g)) && filters.grupos.length === HERPETOFAUNA.length;

  return (
    <div className="space-y-7 rounded-2xl bg-paper-card/60 px-5 py-7 ring-1 ring-forest/10 sm:px-8">
      <Autocomplete filters={filters} setText={setText} especies={especies} ariaLabel="Buscar en toda la fauna" placeholder="Buscar por nombre, familia o palabra clave..." />

      {/* Faceta de grupo + atajo herpetofauna */}
      <div>
        <h4 className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-forest/70">Por grupo</h4>
        <div className="flex flex-wrap gap-2.5">
          {GRUPOS.map((g) => (
            <Chip key={g} active={filters.grupos.includes(g)} onClick={() => toggleVal("grupos", g)}>
              {GRUPO_LABEL[g]}
            </Chip>
          ))}
          <Chip active={herpeActivo} onClick={() => setMany("grupos", herpeActivo ? [] : HERPETOFAUNA)} className="!gap-1.5">
            <Ico name="droplet" className="h-4 w-4" /> Herpetofauna
          </Chip>
        </div>
      </div>

      {/* Núcleo común: taxonomía, presencia, conservación, ocurrencia */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {selects.map((s) => (
          <label key={s.key} className="block">
            <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.12em] text-forest/70">{s.label}</span>
            <div className="relative">
              <select
                value={(filters[s.key] as string[])[0] || ""}
                onChange={(e) => setOne(s.key, e.target.value)}
                className="w-full appearance-none rounded-xl bg-paper-card py-2.5 pl-3.5 pr-9 text-[14px] text-ink ring-1 ring-inset ring-forest/15 focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="">Cualquiera</option>
                {s.options.map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-forest"><Ico name="chevron-down" className="h-4 w-4" /></span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
