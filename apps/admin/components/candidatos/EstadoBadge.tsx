/* EstadoBadge.tsx — badge pendiente/aprobado/descartado (candidatos-admin). */
import type { EstadoCandidato } from "@/lib/candidatos/types";

const TONO: Record<EstadoCandidato, string> = {
  pendiente: "bg-[#f3ead2] text-[#7a5e16] ring-[#e2d3a3]",
  aprobado: "bg-mint-soft text-forest-deep ring-forest/20",
  descartado: "bg-[#f6e1da] text-[#8f3c25] ring-[#b5543a]/20",
};

const ETIQUETA: Record<EstadoCandidato, string> = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  descartado: "Descartado",
};

export function EstadoBadge({ estado }: { estado: EstadoCandidato }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ring-1 ring-inset ${TONO[estado]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {ETIQUETA[estado]}
    </span>
  );
}
