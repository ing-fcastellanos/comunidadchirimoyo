import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllFichas } from "@/lib/content";
import { fichaToEspecie } from "@/lib/search";
import { BuscadorAves } from "@/components/search/BuscadorAves";

/* Buscador especializado por grupo. Por ahora solo aves tiene buscador; el
   buscador general (multi-grupo) y los de anfibios/reptiles llegan en #85. */

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ grupo: "aves" }];
}

export const metadata: Metadata = {
  title: "Buscar aves",
  openGraph: {
    images: [{ url: "/og-aves.jpg", width: 1200, height: 630, alt: "Guía de aves del humedal de Chirimoyo." }],
  },
  twitter: { card: "summary_large_image", images: ["/og-aves.jpg"] },
};

export default async function BuscadorGrupo({ params }: { params: Promise<{ grupo: string }> }) {
  const { grupo } = await params;
  if (grupo !== "aves") notFound();

  const fichas = await getAllFichas();
  const especies = fichas.filter((f) => f.grupo === "aves").map(fichaToEspecie);

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
          <strong className="font-semibold text-forest">{especies.length} especies</strong>{" "}
          registradas en la laguna por forma, tamaño, color o dónde la viste.
        </p>
      </div>

      <BuscadorAves especies={especies} />
    </div>
  );
}
