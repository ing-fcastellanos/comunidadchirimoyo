/* Donaciones.tsx — métodos de donación INFORMATIVOS desde donaciones.json
   (ADR-0007: sin pasarela, el sitio no procesa pagos). Server Component.
   Muestra CLABE/beneficiario, enlace de Spin y contacto en especie. */
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { Donaciones as DonacionesData } from "@/lib/landing";

export function Donaciones({ data }: { data: DonacionesData }) {
  return (
    <Section id="donaciones" className="py-14 sm:py-20">
      <SectionTitle kicker="Apóyanos" icon="HeartHandshake">
        {data.titulo}
      </SectionTitle>
      <p className="mb-8 max-w-2xl text-[17px] leading-relaxed text-ink/75 text-pretty">
        {data.intro}
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {data.metodos.map((m) => (
          <article
            key={m.tipo}
            className="flex flex-col gap-4 rounded-2xl bg-paper-card p-7 shadow-card ring-1 ring-forest/[0.07]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
              <Icon name={m.icono} className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h3 className="font-serif text-[20px] font-semibold leading-tight text-forest-deep text-balance">
                {m.titulo}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/75 text-pretty">
                {m.descripcion}
              </p>

              {m.clabeDisplay && (
                <dl className="mt-4 space-y-1.5 rounded-xl bg-mint-wash/60 p-4 text-[14px]">
                  <div>
                    <dt className="font-semibold text-forest-deep">CLABE</dt>
                    <dd className="font-mono text-[15px] tracking-wide text-ink">
                      {m.clabeDisplay}
                    </dd>
                  </div>
                  {m.beneficiario && (
                    <div>
                      <dt className="font-semibold text-forest-deep">
                        Beneficiario
                      </dt>
                      <dd className="text-ink/80">
                        {m.beneficiario}
                        {m.banco ? ` · ${m.banco}` : ""}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>

            {m.url && (
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3 text-[15px] font-semibold text-paper-card transition-colors hover:bg-forest-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
              >
                Donar con Spin
                <Icon
                  name="ArrowUpRight"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            )}
            {m.contactoEmail && (
              <a
                href={`mailto:${m.contactoEmail}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest/25 px-5 py-3 text-[15px] font-semibold text-forest-deep transition-colors hover:border-forest/40 hover:bg-paper-card focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
              >
                Escríbenos
                <Icon name="Mail" className="h-4 w-4" />
              </a>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
