/* Footer.tsx — pie del ecosistema "Comunidad Chirimoyo", compartido por los 3
   subdominios. Server Component (async): deriva enlaces de content/landing/enlaces.json
   (getEnlaces). Portado del handoff v0.dev (FooterEcosistema.jsx). */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getEnlaces } from "@/lib/landing";

const EXT = { target: "_blank", rel: "noopener noreferrer" } as const;
const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25";

/* Enlaces legales/internos (no vienen del contenido). El aviso de privacidad
   (/privacidad) ya existe; su texto está en borrador hasta su revisión legal. */
const LEGALES = [
  { label: "Noticias", href: "/comunidad/noticias" },
  { label: "Aviso de privacidad", href: "/privacidad" },
  { label: "Proyectos aliados", href: "/aliados" },
  { label: "Galería", href: "/galeria" },
];

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-[12px] font-bold uppercase tracking-[0.22em] text-forest">
      {children}
    </h3>
  );
}

export async function Footer() {
  const { sitios, redes, contacto, ubicacion } = await getEnlaces();
  const { email, telefono, telefonoDisplay } = contacto ?? {};
  const anio = new Date().getFullYear();

  return (
    <footer className="bg-paper-deep text-ink">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.1fr]">
          {/* marca + redes */}
          <div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- logo pequeño desde public/ */}
              <img
                src="/logo-chirimoyo.png"
                alt="Comunidad Chirimoyo"
                className="h-12 w-12 shrink-0 object-contain"
              />
              <span className="font-serif text-[24px] font-semibold leading-none text-forest-deep">
                Comunidad Chirimoyo
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink-soft text-pretty">
              En defensa del humedal del Chirimoyo · Orizaba, Veracruz.
            </p>

            {redes.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {redes.map((r) => (
                  <li key={r.red || r.url}>
                    <a
                      href={r.url}
                      {...EXT}
                      aria-label={r.titulo || r.red || "Red social"}
                      className={`grid h-11 w-11 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10 transition-colors hover:bg-mint-soft hover:text-pine-deep ${FOCO}`}
                    >
                      <Icon name={r.icono} className="h-5 w-5" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* sitios del ecosistema */}
          {sitios.length > 0 && (
            <nav aria-label="Sitios del ecosistema">
              <Kicker>Ecosistema</Kicker>
              <ul className="flex flex-col gap-2.5">
                {sitios.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      {...EXT}
                      className={`inline-flex items-center gap-1.5 text-[15px] font-semibold text-forest transition-colors hover:text-forest-deep ${FOCO}`}
                    >
                      {s.titulo}
                      <Icon name="ArrowUpRight" className="h-4 w-4 opacity-50" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* contacto + ubicación */}
          <div>
            <Kicker>Contacto</Kicker>
            <ul className="flex flex-col gap-3 text-[15px]">
              <li>
                <Link
                  href="/contacto"
                  className={`inline-flex items-center gap-2.5 font-semibold text-forest transition-colors hover:text-forest-deep ${FOCO}`}
                >
                  <Icon name="Send" className="h-[18px] w-[18px] shrink-0 text-forest/60" />
                  Escríbenos
                </Link>
              </li>
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className={`inline-flex items-center gap-2.5 font-semibold text-forest transition-colors hover:text-forest-deep ${FOCO}`}
                  >
                    <Icon name="Mail" className="h-[18px] w-[18px] shrink-0 text-forest/60" />
                    {email}
                  </a>
                </li>
              )}
              {telefono && (
                <li>
                  <a
                    href={`tel:${telefono}`}
                    className={`inline-flex items-center gap-2.5 font-semibold text-forest transition-colors hover:text-forest-deep ${FOCO}`}
                  >
                    <Icon name="Phone" className="h-[18px] w-[18px] shrink-0 text-forest/60" />
                    {telefonoDisplay || telefono}
                  </a>
                </li>
              )}
              {ubicacion?.mapsUrl && (
                <li>
                  <a
                    href={ubicacion.mapsUrl}
                    {...EXT}
                    className={`inline-flex items-start gap-2.5 font-semibold text-forest transition-colors hover:text-forest-deep ${FOCO}`}
                  >
                    <Icon name="MapPin" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-forest/60" />
                    <span>
                      Cómo llegar
                      {(ubicacion.nombre || ubicacion.ciudad) && (
                        <span className="block text-[13px] font-normal text-ink-soft">
                          {[ubicacion.nombre, ubicacion.ciudad].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* línea legal + copyright */}
        <div className="mt-12 flex flex-col gap-4 border-t border-forest/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGALES.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={`text-[13px] font-semibold text-forest transition-colors hover:text-forest-deep ${FOCO}`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-ink-soft">
            © {anio} Comunidad Chirimoyo · Hecho en comunidad.
          </p>
        </div>
      </div>
    </footer>
  );
}
