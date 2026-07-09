/* EstadoBadge.tsx — badge borrador/publicado (#140), espejo de `Badge` de
   components/_shared.jsx del mockup en Claude Design (tonos forest/ochre). */
import type { EstadoNota } from "@/lib/noticias/types";

export function EstadoBadge({ estado }: { estado: EstadoNota }) {
  const publicado = estado === "publicado";
  const tono = publicado
    ? "bg-mint-soft text-forest-deep ring-forest/20"
    : "bg-[#f3ead2] text-[#7a5e16] ring-[#e2d3a3]";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ring-1 ring-inset ${tono}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {publicado ? "Publicado" : "Borrador"}
    </span>
  );
}
