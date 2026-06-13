/* ElHumedal.tsx — banda breve sobre el humedal (mint-wash). Portado del handoff
   v0.dev. Mención breve + enlace a la comunidad; no duplica el relato completo. */
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { COMUNIDAD_URL } from "@/lib/links";

export function ElHumedal() {
  return (
    <div className="border-y border-forest/10 bg-mint-wash">
      <Section className="py-14 sm:py-20">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
              El humedal
            </div>
            <h2 className="font-serif text-[clamp(30px,4.5vw,44px)] font-semibold leading-[1.05] text-forest-deep text-balance">
              Un humedal que vale la pena defender
            </h2>
          </div>

          <div className="max-w-xl">
            <p className="text-[18px] leading-relaxed text-ink/85 text-pretty">
              El humedal del Chirimoyo es una laguna urbana al norte de Orizaba que
              filtra el agua, amortigua las inundaciones y da refugio a decenas de
              especies. Es una de las últimas zonas húmedas vivas de la ciudad.
            </p>
            <p className="mt-3 text-[18px] leading-relaxed text-ink/85 text-pretty">
              Catalogar su fauna es la forma en que la comunidad demuestra, especie
              por especie, por qué este territorio merece protegerse.
            </p>
            <a
              href={COMUNIDAD_URL}
              className="group mt-6 inline-flex items-center gap-2 rounded-md text-[16px] font-semibold text-forest-deep transition-colors hover:text-forest focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
            >
              Conoce la lucha de la comunidad
              <Icon
                name="ArrowRight"
                className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}
