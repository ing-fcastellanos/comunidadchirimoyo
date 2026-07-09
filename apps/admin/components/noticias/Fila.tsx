"use client";
/* Fila.tsx — fila de la tabla de noticias (#140). Client component: agrupa
   las acciones interactivas (alternar estado, borrar) por fila; el resto de
   la página (app/(authed)/noticias/page.tsx) es un Server Component. */
import Link from "next/link";
import { AlternarEstadoBoton } from "./AlternarEstadoBoton";
import { BorrarBoton } from "./BorrarBoton";
import { EstadoBadge } from "./EstadoBadge";
import { Icon } from "@/components/ui/Icon";
import type { NoticiaMeta } from "@/lib/noticias/types";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

function fechaLarga(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

export function Fila({ noticia }: { noticia: NoticiaMeta }) {
  return (
    <tr className="border-b border-forest/10 last:border-0">
      <td className="py-4 pr-4">
        <Link
          href={`/noticias/${noticia.slug}/editar`}
          className={`font-semibold text-ink hover:text-forest-deep hover:underline ${FOCO} rounded`}
        >
          {noticia.titulo}
        </Link>
      </td>
      <td className="whitespace-nowrap py-4 pr-4 text-[14px] text-ink-soft">{fechaLarga(noticia.fecha)}</td>
      <td className="whitespace-nowrap py-4 pr-4">
        <EstadoBadge estado={noticia.estado} />
      </td>
      <td className="py-4">
        <div className="flex items-center gap-1.5">
          <AlternarEstadoBoton slug={noticia.slug} estado={noticia.estado} />
          <Link
            href={`/noticias/${noticia.slug}/editar`}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-forest-deep transition-colors hover:bg-mint-wash ${FOCO}`}
          >
            <Icon name="Pencil" className="h-4 w-4" />
            Editar
          </Link>
          <BorrarBoton slug={noticia.slug} />
        </div>
      </td>
    </tr>
  );
}
