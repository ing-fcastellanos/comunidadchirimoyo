/* Fila.tsx — fila de la tabla de voluntarios, espejo de components/noticias/Fila.tsx. */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { EstadoSuscripcionBadge } from "./EstadoSuscripcionBadge";
import type { VoluntarioConContactos } from "@/lib/voluntarios/read";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

function fechaCorta(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export function Fila({ voluntario }: { voluntario: VoluntarioConContactos }) {
  return (
    <tr className="border-b border-forest/10 last:border-0">
      <td className="py-4 pr-4">
        <Link href={`/voluntarios/${voluntario.id}`} className={`font-semibold text-ink hover:text-forest-deep hover:underline ${FOCO} rounded`}>
          {voluntario.nombre}
        </Link>
        <div className="mt-0.5 text-[13px] text-ink-soft">
          {voluntario.correo}
          {voluntario.telefono ? ` · ${voluntario.telefono}` : ""}
        </div>
      </td>
      <td className="py-4 pr-4 text-[14px] text-ink-soft">
        {voluntario.jornada || <span className="italic text-ink-soft/60">Disponibilidad general</span>}
      </td>
      <td className="whitespace-nowrap py-4 pr-4 text-[14px] text-ink-soft">{fechaCorta(voluntario.creadoEn)}</td>
      <td className="py-4 pr-4">
        <EstadoSuscripcionBadge suscrito={voluntario.suscrito} />
      </td>
      <td className="py-4 pr-4">
        {voluntario.totalContactos > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d6ece6] px-3.5 py-1.5 text-[13px] font-semibold text-[#236b59] ring-1 ring-inset ring-[#aad3c8]">
            <Icon name="Phone" className="h-3.5 w-3.5" />
            {voluntario.totalContactos} {voluntario.totalContactos === 1 ? "contacto" : "contactos"}
          </span>
        ) : (
          <span className="text-[13px] text-ink-soft/60">Sin contactar</span>
        )}
      </td>
      <td className="py-4">
        <Link
          href={`/voluntarios/${voluntario.id}`}
          className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-forest-deep transition-colors hover:bg-mint-wash ${FOCO}`}
        >
          <Icon name="SquareArrowOutUpRight" className="h-4 w-4" />
          Ver detalle
        </Link>
      </td>
    </tr>
  );
}
