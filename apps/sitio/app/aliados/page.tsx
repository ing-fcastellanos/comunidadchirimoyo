/* /aliados — rejilla completa de proyectos aliados desde aliados.json.
   Server Component, sin API. Tolera logo/url nulos y oculta placeholders. */
import { Section } from "@/components/ui/Section";
import { AliadosGrid } from "@/components/landing/AliadosGrid";
import { getAliados } from "@/lib/landing";

export const metadata = { title: "Proyectos aliados" };

export default async function AliadosPage() {
  const data = await getAliados();

  return (
    <Section className="py-16 sm:py-24">
      <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
        Tejemos red · chirimoyo.org
      </div>
      <h1 className="mt-3 font-serif text-[clamp(36px,6vw,64px)] font-semibold leading-[0.98] text-forest-deep text-balance">
        {data.titulo}
      </h1>
      <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-ink/80 text-pretty">
        {data.resumen}
      </p>

      <div className="mt-12">
        <AliadosGrid aliados={data.aliados} />
      </div>
    </Section>
  );
}
