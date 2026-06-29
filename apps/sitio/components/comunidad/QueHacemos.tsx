/* QueHacemos.tsx — rejilla de actividades de la comunidad desde actividades.json.
   Reusa el patrón de tarjetas del catálogo (QueHayAqui). Server Component.
   El número y contenido de tarjetas se derivan del contenido, no se hardcodean. */
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { Actividades } from "@/lib/landing";

export function QueHacemos({ data }: { data: Actividades }) {
  return (
    <Section className="py-14 sm:py-20">
      <SectionTitle kicker="Qué hacemos" icon="Sparkles">
        {data.titulo}
      </SectionTitle>
      <p className="mb-8 max-w-2xl text-[17px] leading-relaxed text-ink/75 text-pretty">
        {data.resumen}
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.actividades.map((a) => (
          <article
            key={a.slug}
            className="flex flex-col gap-4 rounded-2xl bg-paper-card p-7 shadow-card ring-1 ring-forest/[0.07]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
              <Icon name={a.icono} className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-serif text-[22px] font-semibold leading-tight text-forest-deep text-balance">
                {a.titulo}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/75 text-pretty">
                {a.descripcion}
              </p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
