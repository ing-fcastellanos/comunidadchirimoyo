/* Fila.tsx — fila de la tabla de candidatos (candidatos-admin). Server
   Component que compone client components de acción (Aprobar/Descartar/
   Revertir, versión `compacto`) para poder cambiar el estado directamente
   desde el listado, sin entrar a la página de detalle. */
import Link from "next/link";
import { TipoBadge } from "./TipoBadge";
import { EstadoBadge } from "./EstadoBadge";
import { AprobarBoton } from "./AprobarBoton";
import { DescartarBoton } from "./DescartarBoton";
import { RevertirBoton } from "./RevertirBoton";
import type { Candidato } from "@/lib/candidatos/types";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

const CONFIANZA_TONO: Record<Candidato["confianza"], string> = {
  alta: "text-forest-deep",
  media: "text-ink-soft",
  baja: "text-[#8f3c25]",
};

export function Fila({ candidato }: { candidato: Candidato }) {
  return (
    <tr className="border-b border-forest/10 last:border-0">
      <td className="py-4 pr-4">
        <Link
          href={`/candidatos/${candidato.id}`}
          className={`font-semibold text-ink hover:text-forest-deep hover:underline ${FOCO} rounded`}
        >
          {candidato.resumen.length > 90 ? `${candidato.resumen.slice(0, 90)}…` : candidato.resumen}
        </Link>
      </td>
      <td className="whitespace-nowrap py-4 pr-4">
        <TipoBadge tipo={candidato.tipo} />
      </td>
      <td className="whitespace-nowrap py-4 pr-4 text-[14px] text-ink-soft">{candidato.grupoNombre}</td>
      <td className={`whitespace-nowrap py-4 pr-4 text-[13px] font-semibold ${CONFIANZA_TONO[candidato.confianza]}`}>
        {candidato.confianza}
      </td>
      <td className="whitespace-nowrap py-4 pr-4">
        <EstadoBadge estado={candidato.estado} />
      </td>
      <td className="py-4">
        <div className="flex items-center gap-1.5">
          {candidato.estado === "pendiente" ? (
            <>
              <AprobarBoton candidatoId={candidato.id} compacto />
              <DescartarBoton candidatoId={candidato.id} compacto />
            </>
          ) : (
            <RevertirBoton candidatoId={candidato.id} compacto />
          )}
        </div>
      </td>
    </tr>
  );
}
