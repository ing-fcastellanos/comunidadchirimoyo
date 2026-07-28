/* TipoBadge.tsx — badge con ícono para el tipo de candidato (candidatos-admin).
   Mismo criterio visual que components/jornadas/TipoBadge.tsx. */
import { Icon, type IconName } from "@/components/ui/Icon";
import type { TipoCandidato } from "@/lib/candidatos/types";

const TIPO: Record<TipoCandidato, { icono: IconName; etiqueta: string; tono: string }> = {
  noticia: { icono: "Newspaper", etiqueta: "Noticia", tono: "bg-mint-soft text-forest-deep ring-forest/20" },
  jornada: { icono: "Trash2", etiqueta: "Jornada", tono: "bg-[#d6ece6] text-[#236b59] ring-[#aad3c8]" },
  evento: { icono: "PartyPopper", etiqueta: "Evento", tono: "bg-[#f3ead2] text-[#7a5e16] ring-[#e2d3a3]" },
  logro: { icono: "Award", etiqueta: "Logro", tono: "bg-[#f0e4f6] text-[#6b3b82] ring-[#d9c2e6]" },
  aliado: { icono: "Handshake", etiqueta: "Aliado", tono: "bg-[#dbe7f6] text-[#2b5788] ring-[#bcd3ec]" },
};

export function TipoBadge({ tipo }: { tipo: TipoCandidato }) {
  const t = TIPO[tipo] ?? TIPO.noticia;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ring-1 ring-inset ${t.tono}`}>
      <Icon name={t.icono} className="h-3.5 w-3.5" />
      {t.etiqueta}
    </span>
  );
}
