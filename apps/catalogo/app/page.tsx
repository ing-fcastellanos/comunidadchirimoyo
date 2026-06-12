import { getAllFichas } from "@/lib/content";
import { fichaToBird } from "@/lib/search";
import { BuscadorAves } from "@/components/search/BuscadorAves";

export default async function Home() {
  const fichas = await getAllFichas();
  const birds = fichas.map(fichaToBird);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20">
      <div className="pt-8 sm:pt-10">
        <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
          Laguna del Chirimoyo
        </p>
        <h1 className="mt-2 font-serif text-[clamp(28px,4vw,42px)] font-semibold leading-[1.05] text-forest-deep">
          Guía de Aves
        </h1>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink/75">
          Busca entre{" "}
          <strong className="font-semibold text-forest">{birds.length} especies</strong>{" "}
          registradas en la laguna por forma, tamaño, color o dónde la viste.
        </p>
      </div>

      <BuscadorAves birds={birds} />
    </div>
  );
}
