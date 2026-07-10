"use client";
/* Fila.tsx — fila de la tabla de jornadas (#141). Sin acción de alternar
   estado (a diferencia de noticias/Fila.tsx) — las jornadas no tienen
   concepto de borrador/publicado (design.md D3). */
import Link from "next/link";
import { BorrarBoton } from "./BorrarBoton";
import { TipoBadge } from "./TipoBadge";
import { Icon } from "@/components/ui/Icon";
import { resumenRegla } from "@/lib/jornadas/resumen";
import type { Jornada } from "@/lib/jornadas/types";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

export function Fila({ jornada }: { jornada: Jornada }) {
  return (
    <tr className="border-b border-forest/10 last:border-0">
      <td className="py-4 pr-4">
        <Link
          href={`/jornadas/${jornada.slug}/editar`}
          className={`font-semibold text-ink hover:text-forest-deep hover:underline ${FOCO} rounded`}
        >
          {jornada.titulo}
        </Link>
      </td>
      <td className="whitespace-nowrap py-4 pr-4">
        <TipoBadge tipo={jornada.tipo} />
      </td>
      <td className="py-4 pr-4 text-[14px] text-ink-soft">{resumenRegla(jornada)}</td>
      <td className="py-4">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/jornadas/${jornada.slug}/editar`}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-forest-deep transition-colors hover:bg-mint-wash ${FOCO}`}
          >
            <Icon name="Pencil" className="h-4 w-4" />
            Editar
          </Link>
          <BorrarBoton slug={jornada.slug} />
        </div>
      </td>
    </tr>
  );
}
