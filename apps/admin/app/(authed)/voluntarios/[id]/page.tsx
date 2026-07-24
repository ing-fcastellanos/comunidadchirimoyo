/* app/(authed)/voluntarios/[id]/page.tsx — detalle de un voluntario
   (voluntarios-suscripcion-panel-admin): datos de inscripción, toggle manual
   de suscripción, y el log de contactos completo + formulario para agregar
   uno nuevo. */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { AlternarSuscripcionBoton } from "@/components/voluntarios/AlternarSuscripcionBoton";
import { ContactoItem } from "@/components/voluntarios/ContactoItem";
import { FormularioContacto } from "@/components/voluntarios/FormularioContacto";
import { agregarContacto } from "@/lib/voluntarios/actions";
import { getContactosVoluntario, getVoluntarioAdmin } from "@/lib/voluntarios/read";

export const dynamic = "force-dynamic";

function fechaLarga(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

export default async function VoluntarioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const voluntario = await getVoluntarioAdmin(id);
  if (!voluntario) notFound();

  const contactos = await getContactosVoluntario(id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/voluntarios"
        className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-forest-deep hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40 rounded"
      >
        <Icon name="ArrowLeft" className="h-4 w-4" />
        Volver a voluntarios
      </Link>

      <header className="mb-8 rounded-2xl bg-paper-card p-6 shadow-card ring-1 ring-forest/10 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-0.5 text-[12px] font-bold uppercase tracking-[0.22em] text-forest">Voluntario</div>
            <h1 className="font-serif text-[28px] font-semibold leading-tight text-forest-deep">{voluntario.nombre}</h1>
            <p className="mt-1 text-[14px] text-ink-soft">
              {voluntario.correo}
              {voluntario.telefono ? ` · ${voluntario.telefono}` : ""}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-forest/10 pt-5 sm:grid-cols-2">
          <div>
            <dt className="text-[12px] font-bold uppercase tracking-wide text-ink-soft">Jornada</dt>
            <dd className="mt-0.5 text-[14px] text-ink">{voluntario.jornada || "Disponibilidad general"}</dd>
          </div>
          <div>
            <dt className="text-[12px] font-bold uppercase tracking-wide text-ink-soft">Inscrito el</dt>
            <dd className="mt-0.5 text-[14px] text-ink">{fechaLarga(voluntario.creadoEn)}</dd>
          </div>
          <div>
            <dt className="text-[12px] font-bold uppercase tracking-wide text-ink-soft">Acompañantes</dt>
            <dd className="mt-0.5 text-[14px] text-ink">{voluntario.acompanantes}</dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-forest/10 pt-5">
          <AlternarSuscripcionBoton voluntarioId={voluntario.id} suscrito={voluntario.suscrito} />
        </div>
      </header>

      <section>
        <h2 className="mb-4 font-serif text-[22px] font-semibold text-forest-deep">Log de contactos</h2>

        <FormularioContacto accion={agregarContacto.bind(null, voluntario.id)} />

        {contactos.length === 0 ? (
          <div className="rounded-2xl bg-paper-card p-8 text-center shadow-card ring-1 ring-forest/10">
            <p className="text-[14px] text-ink-soft">Todavía no hay contactos registrados.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {contactos.map((c) => (
              <ContactoItem key={c.id} contacto={c} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
