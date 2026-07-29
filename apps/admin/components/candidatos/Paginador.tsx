/* Paginador.tsx — paginación del listado de candidatos (candidatos-admin).
   Link-based (Server Component friendly), mismo criterio que FiltrosBar:
   preserva los filtros activos en la query string al cambiar de página. */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { EstadoCandidato, TipoCandidato } from "@/lib/candidatos/types";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

interface Props {
  paginaActual: number;
  totalPaginas: number;
  tipo: TipoCandidato | "todos";
  grupoId: string;
  estado: EstadoCandidato | "todos";
}

export function Paginador({ paginaActual, totalPaginas, tipo, grupoId, estado }: Props) {
  if (totalPaginas <= 1) return null;

  function href(pagina: number): string {
    const params = new URLSearchParams({ tipo, grupoId, estado, pagina: String(pagina) });
    return `/candidatos?${params.toString()}`;
  }

  const boton = (etiqueta: string, icono: "ChevronLeft" | "ChevronRight", pagina: number, deshabilitado: boolean) =>
    deshabilitado ? (
      <span className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-ink-soft/40">
        {icono === "ChevronLeft" && <Icon name={icono} className="h-4 w-4" />}
        {etiqueta}
        {icono === "ChevronRight" && <Icon name={icono} className="h-4 w-4" />}
      </span>
    ) : (
      <Link
        href={href(pagina)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-forest-deep transition-colors hover:bg-mint-wash ${FOCO}`}
      >
        {icono === "ChevronLeft" && <Icon name={icono} className="h-4 w-4" />}
        {etiqueta}
        {icono === "ChevronRight" && <Icon name={icono} className="h-4 w-4" />}
      </Link>
    );

  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      {boton("Anterior", "ChevronLeft", paginaActual - 1, paginaActual <= 1)}
      <span className="text-[13px] text-ink-soft">
        Página {paginaActual} de {totalPaginas}
      </span>
      {boton("Siguiente", "ChevronRight", paginaActual + 1, paginaActual >= totalPaginas)}
    </div>
  );
}
