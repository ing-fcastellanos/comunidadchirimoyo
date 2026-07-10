/* TipoBadge.tsx — badge con ícono para el tipo de jornada (#141). Mismo
   mapeo visual que apps/sitio/components/voluntarios/ProximasJornadas.tsx
   (limpieza/pajareada/evento) para que el admin y el sitio se vean
   consistentes. */
import { Icon, type IconName } from "@/components/ui/Icon";
import type { TipoJornada } from "@/lib/jornadas/types";

const TIPO: Record<TipoJornada, { icono: IconName; etiqueta: string; tono: string }> = {
  limpieza: { icono: "Trash2", etiqueta: "Limpieza", tono: "bg-mint-soft text-forest-deep ring-forest/20" },
  pajareada: { icono: "Binoculars", etiqueta: "Pajareada", tono: "bg-[#d6ece6] text-[#236b59] ring-[#aad3c8]" },
  evento: { icono: "PartyPopper", etiqueta: "Evento", tono: "bg-[#f3ead2] text-[#7a5e16] ring-[#e2d3a3]" },
};

export function TipoBadge({ tipo }: { tipo: TipoJornada }) {
  const t = TIPO[tipo] ?? TIPO.evento;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ring-1 ring-inset ${t.tono}`}>
      <Icon name={t.icono} className="h-3.5 w-3.5" />
      {t.etiqueta}
    </span>
  );
}
