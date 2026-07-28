/* FiltrosBar.tsx — filtros de la lista de candidatos como links con query
   string (Server Component friendly, mismo patrón que
   components/voluntarios/FiltrosBar.tsx: page.tsx lee `searchParams` y
   consulta Firestore ya filtrado). */
import Link from "next/link";
import { getGrupos } from "@/lib/candidatos/types";
import type { EstadoCandidato, TipoCandidato } from "@/lib/candidatos/types";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

const TIPOS: Array<{ value: TipoCandidato | "todos"; etiqueta: string }> = [
  { value: "todos", etiqueta: "Todos" },
  { value: "noticia", etiqueta: "Noticia" },
  { value: "jornada", etiqueta: "Jornada" },
  { value: "evento", etiqueta: "Evento" },
  { value: "logro", etiqueta: "Logro" },
  { value: "aliado", etiqueta: "Aliado" },
];

const ESTADOS: Array<{ value: EstadoCandidato | "todos"; etiqueta: string }> = [
  { value: "pendiente", etiqueta: "Pendientes" },
  { value: "todos", etiqueta: "Todos" },
  { value: "aprobado", etiqueta: "Aprobados" },
  { value: "descartado", etiqueta: "Descartados" },
];

function Chip({ activo, href, children }: { activo: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold ring-1 transition-colors ${FOCO} ${
        activo ? "bg-forest text-white ring-forest" : "bg-paper-card text-ink-soft ring-forest/15 hover:bg-mint-wash"
      }`}
    >
      {children}
    </Link>
  );
}

export function FiltrosBar({
  tipo,
  grupoId,
  estado,
}: {
  tipo: TipoCandidato | "todos";
  grupoId: string;
  estado: EstadoCandidato | "todos";
}) {
  function conFiltro(clave: string, valor: string): string {
    const params = new URLSearchParams({ tipo, grupoId, estado });
    params.set(clave, valor);
    return `/candidatos?${params.toString()}`;
  }

  return (
    <div className="mb-5 flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Estado:</span>
        {ESTADOS.map((e) => (
          <Chip key={e.value} activo={estado === e.value} href={conFiltro("estado", e.value)}>
            {e.etiqueta}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Tipo:</span>
        {TIPOS.map((t) => (
          <Chip key={t.value} activo={tipo === t.value} href={conFiltro("tipo", t.value)}>
            {t.etiqueta}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Grupo:</span>
        <Chip activo={grupoId === "todos"} href={conFiltro("grupoId", "todos")}>
          Todos
        </Chip>
        {getGrupos().map((g) => (
          <Chip key={g.id} activo={grupoId === g.id} href={conFiltro("grupoId", g.id)}>
            {g.nombre}
          </Chip>
        ))}
      </div>
    </div>
  );
}
