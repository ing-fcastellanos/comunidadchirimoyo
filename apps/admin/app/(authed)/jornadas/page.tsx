/* app/(authed)/jornadas/page.tsx — lista de jornadas (#141). Server
   Component: lee TODAS las jornadas (recurrentes + eventos) vía
   getAllJornadasAdmin, sin paginación. Mockup: Claude Design, proyecto
   "Guia aves chirimoyo" (Jornadas.html / components/JornadasLista.jsx). */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Fila } from "@/components/jornadas/Fila";
import { getAllJornadasAdmin } from "@/lib/jornadas/read";

export const dynamic = "force-dynamic";

export default async function JornadasPage() {
  const jornadas = await getAllJornadasAdmin();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="mb-0.5 text-[12px] font-bold uppercase tracking-[0.22em] text-forest">Panel · Admin</div>
          <h1 className="font-serif text-[32px] font-semibold leading-tight text-forest-deep">Jornadas</h1>
          <p className="mt-1 text-[14px] text-ink-soft">{jornadas.length} jornadas · recurrentes y eventos</p>
        </div>
        <Link
          href="/jornadas/nueva"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-forest px-5 text-[14px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(12,90,54,.7)] transition-colors hover:bg-forest-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40"
        >
          <Icon name="Plus" className="h-[18px] w-[18px]" />
          Nueva jornada
        </Link>
      </header>

      <div className="overflow-x-auto rounded-2xl bg-paper-card p-2 shadow-card ring-1 ring-forest/10 sm:p-3">
        {jornadas.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-mint-wash text-forest-deep ring-1 ring-forest/10">
              <Icon name="CalendarDays" className="h-6 w-6" />
            </span>
            <p className="mt-4 text-[15px] text-ink-soft">Todavía no hay jornadas. Crea la primera.</p>
          </div>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-forest/15">
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Título</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Tipo</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Regla / Fecha</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&_td]:px-3">
              {jornadas.map((j) => (
                <Fila key={j.slug} jornada={j} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
