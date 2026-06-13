import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllFichas } from "@/lib/content";
import { parseSecciones, fotosVista, audiosVista, badgesDe, relacionadas, resumenDescripcion } from "@/lib/ficha";
import {
  HeroFicha,
  QuickFacts,
  DescripcionSec,
  DetailCards,
  DistribucionSec,
  ObservacionSec,
  VocalizacionSec,
  ConservacionSec,
  TaxonomiaSec,
  RelacionadasNav,
} from "@/components/ficha/secciones";

type Params = { params: Promise<{ slug: string }> };

/** Solo se generan las rutas de las especies existentes (export estático). */
export const dynamicParams = false;

export async function generateStaticParams() {
  const fichas = await getAllFichas();
  return fichas.map((f) => ({ slug: f.slug }));
}

async function cargar(slug: string) {
  const todas = await getAllFichas();
  return { ficha: todas.find((f) => f.slug === slug), todas };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { ficha } = await cargar(slug);
  if (!ficha) return {};
  const desc =
    resumenDescripcion(parseSecciones(ficha.cuerpo)) ||
    `Ficha de ${ficha.nombreComun} (${ficha.nombreCientifico}) en la Laguna del Chirimoyo.`;
  const img = fotosVista(ficha)[0]?.src;
  const images = img ? [img] : [];
  return {
    title: ficha.nombreComun,
    description: desc,
    openGraph: { title: ficha.nombreComun, description: desc, images, type: "article" },
    twitter: { card: "summary_large_image", title: ficha.nombreComun, description: desc, images },
  };
}

export default async function FichaPage({ params }: Params) {
  const { slug } = await params;
  const { ficha, todas } = await cargar(slug);
  if (!ficha) notFound();

  const sec = parseSecciones(ficha.cuerpo);
  const fotos = fotosVista(ficha);
  const audios = audiosVista(ficha);
  const badges = badgesDe(ficha);
  const resumen = resumenDescripcion(sec);
  const rel = relacionadas(ficha, todas);

  return (
    <article className="pb-12">
      <HeroFicha ficha={ficha} fotos={fotos} badges={badges} resumen={resumen} />
      <QuickFacts ficha={ficha} />
      {sec.descripcion && <DescripcionSec texto={sec.descripcion} pullQuote={ficha.pullQuote} />}
      <DetailCards dieta={sec.dietaEcologia} reproduccion={sec.reproduccion} />
      <DistribucionSec texto={sec.distribucion} />
      <ObservacionSec comoIdentificarla={sec.comoIdentificarla} dondeObservarla={sec.dondeObservarla} />
      <VocalizacionSec audios={audios} />
      <ConservacionSec ficha={ficha} sabiasQue={sec.sabiasQue} />
      <TaxonomiaSec ficha={ficha} />
      <RelacionadasNav relacionadas={rel} />
    </article>
  );
}
