/* Linktree.tsx — "árbol de enlaces" del ecosistema del proyecto. Portado del
   handoff v0.dev (components/Linktree.jsx). Server Component. Distinto de la nav
   del header: tarjetas grandes tocables + banda destacada (pine-deep) con redes,
   contacto y ubicación. Consume enlaces.json. */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { Enlaces, SitioEnlace, RedEnlace } from "@/lib/landing";

const EXT = { target: "_blank", rel: "noopener noreferrer" } as const;
const foco =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest/25";
const focoClaro =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

function SitioCard({ sitio }: { sitio: SitioEnlace }) {
  const { titulo, descripcion, url, icono } = sitio;
  return (
    <a
      href={url}
      {...EXT}
      className={`group flex items-start gap-4 rounded-2xl bg-paper-card p-5 shadow-card ring-1 ring-forest/[0.07] transition hover:ring-forest/25 hover:shadow-[0_14px_34px_-14px_rgba(7,61,36,.32)] ${foco}`}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
        <Icon name={icono ?? "CircleDot"} className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-serif text-[22px] font-semibold leading-tight text-forest-deep text-pretty">
          {titulo}
        </span>
        {descripcion && (
          <span className="mt-1.5 block text-[14px] leading-snug text-ink-soft text-pretty">
            {descripcion}
          </span>
        )}
      </span>
      <Icon
        name="ArrowUpRight"
        className="mt-1 h-5 w-5 shrink-0 text-forest/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest"
      />
    </a>
  );
}

function RedChip({ item }: { item: RedEnlace }) {
  const { titulo, url, icono } = item;
  return (
    <a
      href={url}
      {...EXT}
      className={`inline-flex items-center gap-2 rounded-full bg-paper/10 px-4 py-2 text-[14px] font-semibold text-paper ring-1 ring-inset ring-paper/20 transition hover:bg-paper/20 ${focoClaro}`}
    >
      <Icon name={icono ?? "CircleDot"} className="h-[18px] w-[18px]" />
      {titulo}
    </a>
  );
}

export function Linktree({ data }: { data: Enlaces }) {
  const { sitios, redes, contacto, ubicacion } = data;
  const { email, telefono, telefonoDisplay } = contacto ?? {};

  return (
    <Section className="py-14 sm:py-20">
      <SectionTitle icon="Compass" kicker="El ecosistema">
        Todo el proyecto, en un lugar
      </SectionTitle>

      {sitios.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sitios.map((s) => (
            <SitioCard key={s.slug || s.url} sitio={s} />
          ))}
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-pine-deep px-6 py-8 text-paper shadow-card sm:px-9 sm:py-9">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* redes */}
          <div>
            <div className="text-[12px] font-bold uppercase tracking-[0.22em] text-mint">
              Síguenos
            </div>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-paper/80">
              Compartimos avistamientos, jornadas y novedades del humedal.
            </p>
            {redes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2.5">
                {redes.map((r) => (
                  <RedChip key={r.red || r.url} item={r} />
                ))}
              </div>
            )}
          </div>

          {/* contacto + ubicación */}
          <div className="lg:border-l lg:border-paper/15 lg:pl-8">
            <div className="text-[12px] font-bold uppercase tracking-[0.22em] text-mint">
              Escríbenos
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {/* Acción primaria: el formulario de contacto (/contacto). El email
                  queda como alternativa directa. */}
              <Link
                href="/contacto"
                className={`inline-flex items-center gap-3 rounded-xl bg-mint px-4 py-3 text-[15px] font-semibold text-pine-deep transition hover:bg-mint-deep hover:text-paper ${focoClaro}`}
              >
                <Icon name="Send" className="h-5 w-5 shrink-0" />
                <span className="min-w-0">Enviar un mensaje</span>
              </Link>
              {email && (
                <a
                  href={`mailto:${email}`}
                  className={`inline-flex items-center gap-3 rounded-xl bg-paper/10 px-4 py-3 text-[15px] font-semibold text-paper ring-1 ring-inset ring-paper/20 transition hover:bg-paper/20 ${focoClaro}`}
                >
                  <Icon name="Mail" className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">{email}</span>
                </a>
              )}
              {telefono && (
                <a
                  href={`tel:${telefono}`}
                  className={`inline-flex items-center gap-3 rounded-xl bg-paper/10 px-4 py-3 text-[15px] font-semibold text-paper ring-1 ring-inset ring-paper/20 transition hover:bg-paper/20 ${focoClaro}`}
                >
                  <Icon name="Phone" className="h-5 w-5 shrink-0" />
                  <span>{telefonoDisplay || telefono}</span>
                </a>
              )}
              {ubicacion && ubicacion.mapsUrl && (
                <a
                  href={ubicacion.mapsUrl}
                  {...EXT}
                  className={`inline-flex items-center gap-3 rounded-xl bg-paper/10 px-4 py-3 text-[15px] font-semibold text-paper ring-1 ring-inset ring-paper/20 transition hover:bg-paper/20 ${focoClaro}`}
                >
                  <Icon name="MapPin" className="h-5 w-5 shrink-0 text-mint" />
                  <span className="min-w-0">
                    <span className="block leading-tight">Cómo llegar</span>
                    {(ubicacion.nombre || ubicacion.ciudad) && (
                      <span className="block text-[12px] font-normal text-paper/70">
                        {[ubicacion.nombre, ubicacion.ciudad].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
