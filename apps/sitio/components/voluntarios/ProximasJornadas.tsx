/* ProximasJornadas.tsx — sección "Próximas jornadas" de /voluntarios (#22b).
   Server Component: recibe las ocurrencias ya expandidas (lib/jornadas.ts) y las
   muestra como tarjetas. Si no hay próximas, no se renderiza (la página apoya en
   el enlace al calendario). */
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Ocurrencia, TipoJornada } from "@/lib/jornadas";

const TIPO: Record<TipoJornada, { icono: IconName; etiqueta: string }> = {
  limpieza: { icono: "Trash2", etiqueta: "Limpieza" },
  pajareada: { icono: "Binoculars", etiqueta: "Pajareada" },
  evento: { icono: "PartyPopper", etiqueta: "Evento" },
};

function fechaLarga(d: Date): string {
  return new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(d);
}

export function ProximasJornadas({ ocurrencias }: { ocurrencias: Ocurrencia[] }) {
  if (ocurrencias.length === 0) return null;

  return (
    <Section className="py-14 sm:py-20">
      <SectionTitle kicker="Calendario" icon="CalendarDays">
        Próximas jornadas
      </SectionTitle>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ocurrencias.map((o, i) => {
          const t = TIPO[o.tipo];
          return (
            <article
              key={`${o.slug}-${i}`}
              className="flex flex-col rounded-2xl bg-paper-card p-6 shadow-card ring-1 ring-forest/[0.07]"
            >
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-mint-wash px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-forest-deep ring-1 ring-forest/10">
                <Icon name={t.icono} className="h-[14px] w-[14px]" />
                {t.etiqueta}
              </span>
              <h3 className="mt-3 font-serif text-[20px] font-semibold leading-tight text-forest-deep text-balance">
                {o.titulo}
              </h3>
              <p className="mt-2 flex items-center gap-2 text-[15px] font-semibold text-forest">
                <Icon name="CalendarDays" className="h-[16px] w-[16px] text-forest/60" />
                <span className="capitalize">{fechaLarga(o.fecha)}</span>
                {o.hora && <span className="ml-1.5 text-ink/70">· {o.hora}</span>}
              </p>
              {o.lugar && (
                <p className="mt-1.5 flex items-center gap-2 text-[14px] text-ink/70">
                  <Icon name="MapPin" className="h-[15px] w-[15px] text-forest/50" />
                  {o.lugar}
                </p>
              )}
              {o.descripcion && (
                <p className="mt-3 text-[14px] leading-relaxed text-ink/70 text-pretty">{o.descripcion}</p>
              )}
            </article>
          );
        })}
      </div>
    </Section>
  );
}
