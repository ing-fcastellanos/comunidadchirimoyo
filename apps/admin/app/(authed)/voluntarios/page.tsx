/* app/(authed)/voluntarios/page.tsx — lista de voluntarios inscritos
   (voluntarios-suscripcion-panel-admin). Server Component: lee filtros de la
   query string y consulta Firestore ya filtrado (FiltrosBar es Link-based,
   no estado de cliente — así el export de CSV puede reusar los mismos
   parámetros, design.md D7). Sin paginación (volumen bajo). */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Fila } from "@/components/voluntarios/Fila";
import { FiltrosBar } from "@/components/voluntarios/FiltrosBar";
import { getAllVoluntariosAdmin } from "@/lib/voluntarios/read";
import type { FiltroContacto, FiltroSuscripcion } from "@/lib/voluntarios/types";

export const dynamic = "force-dynamic";

function comoFiltroSuscripcion(v: string | undefined): FiltroSuscripcion {
  return v === "suscritos" || v === "no-suscritos" ? v : "todos";
}

function comoFiltroContacto(v: string | undefined): FiltroContacto {
  return v === "contactados" || v === "sin-contactar" ? v : "todos";
}

export default async function VoluntariosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const suscripcion = comoFiltroSuscripcion(typeof sp.suscripcion === "string" ? sp.suscripcion : undefined);
  const contacto = comoFiltroContacto(typeof sp.contacto === "string" ? sp.contacto : undefined);

  const voluntarios = await getAllVoluntariosAdmin({ suscripcion, contacto });
  const queryExport = new URLSearchParams({ suscripcion, contacto }).toString();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="mb-0.5 text-[12px] font-bold uppercase tracking-[0.22em] text-forest">Panel · Admin</div>
          <h1 className="font-serif text-[32px] font-semibold leading-tight text-forest-deep">Voluntarios</h1>
          <p className="mt-1 text-[14px] text-ink-soft">{voluntarios.length} inscritos con estos filtros</p>
        </div>
        <Link
          href={`/api/export/voluntarios.csv?${queryExport}`}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-forest px-5 text-[14px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(12,90,54,.7)] transition-colors hover:bg-forest-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40"
        >
          <Icon name="Download" className="h-[18px] w-[18px]" />
          Exportar CSV
        </Link>
      </header>

      <FiltrosBar suscripcion={suscripcion} contacto={contacto} />

      <div className="overflow-x-auto rounded-2xl bg-paper-card p-2 shadow-card ring-1 ring-forest/10 sm:p-3">
        {voluntarios.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-mint-wash text-forest-deep ring-1 ring-forest/10">
              <Icon name="Users" className="h-6 w-6" />
            </span>
            <p className="mt-4 text-[15px] text-ink-soft">Ningún voluntario coincide con estos filtros.</p>
          </div>
        ) : (
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-forest/15">
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Voluntario</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Jornada</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Inscrito</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Suscripción</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Contacto</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&_td]:px-3">
              {voluntarios.map((v) => (
                <Fila key={v.id} voluntario={v} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
