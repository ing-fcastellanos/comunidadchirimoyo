import type { Metadata } from "next";
import { getColaboradores } from "@/lib/colaboradores";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";

/* /colaboradores — reconocimiento al equipo que hizo posible la guía de fauna:
   biólogos e identificación, fotografía y desarrollo (#77). Server Component
   estático; el contenido vive curado en content/fauna/colaboradores.json. La
   categoría comunidad se reconoce en la sección /comunidad del sitio. Las
   atribuciones CC externas (iNaturalist) y las grabaciones (xeno-canto) NO se
   listan aquí: su autoría se acredita en cada ficha. */

export const metadata: Metadata = {
  title: "Colaboradores · Guía de fauna del Chirimoyo",
  description:
    "Reconocimiento a las personas que hicieron posible la guía de fauna del humedal del Chirimoyo: biólogos e identificación, fotografía y desarrollo.",
  openGraph: {
    title: "Colaboradores · Guía de fauna del Chirimoyo",
    description:
      "Las personas que hicieron posible la guía de fauna del humedal del Chirimoyo.",
    type: "website",
    images: [{ url: "/og-fauna.jpg", width: 1200, height: 630, alt: "Guía de la fauna del humedal de Chirimoyo." }],
  },
  twitter: { card: "summary_large_image", images: ["/og-fauna.jpg"] },
};

export default async function ColaboradoresPage() {
  const grupos = await getColaboradores();

  return (
    <Section className="py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest-deep">
          Guía de fauna del Chirimoyo
        </p>
        <h1 className="mt-2 font-serif text-[clamp(28px,4vw,42px)] font-semibold leading-[1.05] text-forest-deep text-balance">
          Colaboradores
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-ink/75 text-pretty">
          Esta guía existe gracias al trabajo compartido de quienes identificaron
          especies, fotografiaron la fauna del humedal y construyeron el catálogo.
          Gracias por defender el Chirimoyo conociéndolo.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-12">
        {grupos.map((grupo) => (
          <section key={grupo.rol}>
            <div className="mb-5 flex items-center gap-2.5">
              {grupo.icono && (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
                  <Icon name={grupo.icono} className="h-5 w-5" />
                </span>
              )}
              <h2 className="font-serif text-[24px] font-semibold leading-tight text-forest-deep">
                {grupo.rol}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grupo.personas.map((persona) => (
                <article
                  key={persona.nombre}
                  className="flex flex-col rounded-2xl bg-paper-card p-5 shadow-soft ring-1 ring-forest/[0.07]"
                >
                  <h3 className="font-serif text-[18px] font-semibold leading-snug text-forest-deep text-balance">
                    {persona.nombre}
                  </h3>
                  <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-ink/75 text-pretty">
                    {persona.aporte}
                  </p>
                  {persona.enlace && (
                    <a
                      href={persona.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-forest-deep transition-colors hover:text-forest focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25 rounded-md"
                    >
                      <Icon name="ExternalLink" className="h-[15px] w-[15px]" />
                      Ver perfil
                    </a>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 max-w-2xl border-t border-forest/10 pt-6 text-[13.5px] leading-relaxed text-ink-soft/80">
        Muchas fichas incluyen además fotografías bajo licencia Creative Commons
        (iNaturalist) y grabaciones de cantos de{" "}
        <span className="whitespace-nowrap">xeno-canto</span>; la autoría de cada
        una se acredita en la ficha de la especie correspondiente.
      </p>
    </Section>
  );
}
