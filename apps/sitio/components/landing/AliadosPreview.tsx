/* AliadosPreview.tsx — preview de proyectos aliados en el landing (subconjunto)
   con enlace a /aliados. Server Component. Si aún no hay aliados reales, muestra
   el estado vacío de AliadosGrid sin el enlace redundante. */
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Icon } from "@/components/ui/Icon";
import { AliadosGrid, esPlaceholder } from "./AliadosGrid";
import type { Aliados } from "@/lib/landing";

const MAX_PREVIEW = 3;

export function AliadosPreview({ data }: { data: Aliados }) {
  const reales = data.aliados.filter((a) => !esPlaceholder(a));
  const muestra = reales.slice(0, MAX_PREVIEW);
  const hayMas = reales.length > MAX_PREVIEW;

  return (
    <Section className="py-14 sm:py-20">
      <SectionTitle kicker="Tejemos red" icon="Handshake">
        {data.titulo}
      </SectionTitle>
      <p className="mb-8 max-w-2xl text-[17px] leading-relaxed text-ink/75 text-pretty">
        {data.resumen}
      </p>

      <AliadosGrid aliados={muestra.length > 0 ? muestra : data.aliados} />

      <Link
        href="/aliados"
        className="group mt-8 inline-flex items-center gap-2 text-[16px] font-semibold text-forest transition-colors hover:text-forest-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25 rounded-md"
      >
        {hayMas ? "Ver todos los aliados" : "Conoce a los aliados"}
        <Icon
          name="ArrowRight"
          className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </Section>
  );
}
