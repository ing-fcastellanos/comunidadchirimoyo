/* EstadoSuscripcionBadge.tsx — badge suscrito/no suscrito, espejo de
   EstadoBadge.tsx (noticias) en tonos forest/terra. */
import { Icon } from "@/components/ui/Icon";

export function EstadoSuscripcionBadge({ suscrito }: { suscrito: boolean }) {
  const tono = suscrito
    ? "bg-mint-soft text-forest-deep ring-forest/20"
    : "bg-[#f6e1da] text-[#8f3c25] ring-[#e8c3b6]";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ring-1 ring-inset ${tono}`}>
      <Icon name={suscrito ? "MailCheck" : "MailX"} className="h-3.5 w-3.5" />
      {suscrito ? "Suscrito" : "No suscrito"}
    </span>
  );
}
