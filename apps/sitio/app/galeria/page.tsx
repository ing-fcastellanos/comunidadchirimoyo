/* /galeria — rejilla masonry de fotos del humedal + lightbox, desde galeria.json.
   La página es Server Component; la interacción vive en el contenedor cliente. */
import { Section } from "@/components/ui/Section";
import { Galeria } from "@/components/landing/Galeria";
import { getGaleria, getGaleriaFotos } from "@/lib/landing";

export const metadata = {
  title: "Galería",
  alternates: { canonical: "/galeria" },
};

export default async function GaleriaPage() {
  const [meta, fotos] = await Promise.all([getGaleria(), getGaleriaFotos()]);

  return (
    <Section className="py-16 sm:py-24">
      <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest-deep">
        Imágenes del humedal · chirimoyo.org
      </div>
      <h1 className="mt-3 font-serif text-[clamp(36px,6vw,64px)] font-semibold leading-[0.98] text-forest-deep text-balance">
        {meta.titulo}
      </h1>
      <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-ink/80 text-pretty">
        {meta.resumen}
      </p>

      <div className="mt-12">
        <Galeria fotos={fotos} />
      </div>
    </Section>
  );
}
