/* KindBadge.tsx — badge de solo lectura (Recurrente/Evento) en la página de
   edición (#141). A diferencia de EstadoBadge de noticias, aquí no hay
   toggle: kind es inmutable tras crear (design.md D5). */
export function KindBadge({ kind }: { kind: "recurrente" | "evento" }) {
  const recurrente = kind === "recurrente";
  const tono = recurrente
    ? "bg-mint-soft text-forest-deep ring-forest/20"
    : "bg-[#f3ead2] text-[#7a5e16] ring-[#e2d3a3]";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ring-1 ring-inset ${tono}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {recurrente ? "Recurrente" : "Evento"}
    </span>
  );
}
