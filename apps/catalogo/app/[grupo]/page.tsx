import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllFichas } from "@/lib/content";
import { GRUPO_LABEL, type Grupo } from "@/lib/fauna-schema";
import { fichaToEspecie } from "@/lib/search";
import { buildHeroSlides } from "@/lib/hero";
import { COMUNIDAD_URL } from "@/lib/links";
import { Hero } from "@/components/home/Hero";
import { QueHayAqui } from "@/components/home/QueHayAqui";
import { ElHumedal } from "@/components/home/ElHumedal";
import { CierreCTA } from "@/components/home/CierreCTA";
import { IndiceGrupo } from "@/components/grupo/IndiceGrupo";
import { Proximamente } from "@/components/grupo/Proximamente";

/* Página índice por grupo. Una sola jerarquía dinámica sirve a todos los grupos
   (ADR-0024): aves rinde el landing rico; anfibios/reptiles, el placeholder
   «próximamente» hasta que lleguen sus datos (#88). */

const GRUPOS_VALIDOS: Grupo[] = ["aves", "anfibios", "reptiles"];

/** Solo se generan los grupos válidos (export estático). */
export const dynamicParams = false;

export function generateStaticParams() {
  return GRUPOS_VALIDOS.map((grupo) => ({ grupo }));
}

export async function generateMetadata({ params }: { params: Promise<{ grupo: string }> }): Promise<Metadata> {
  const { grupo } = await params;
  if (!GRUPOS_VALIDOS.includes(grupo as Grupo)) return {};
  return { title: GRUPO_LABEL[grupo as Grupo] };
}

export default async function GrupoPage({ params }: { params: Promise<{ grupo: string }> }) {
  const { grupo } = await params;
  if (grupo === "aves") return <LandingAves />;
  if (grupo === "anfibios" || grupo === "reptiles") {
    const especies = (await getAllFichas())
      .filter((f) => f.grupo === grupo)
      .map(fichaToEspecie);
    // Con fichas: índice-grilla. Sin fichas todavía: placeholder «Próximamente».
    if (especies.length > 0) return <IndiceGrupo grupo={grupo} especies={especies} />;
    return (
      <Proximamente
        eyebrow={`Catálogo de fauna · ${GRUPO_LABEL[grupo]}`}
        titulo={`${GRUPO_LABEL[grupo]} del Chirimoyo`}
        descripcion="Estamos preparando las fichas de este grupo del humedal. Muy pronto podrás explorarlas aquí."
      />
    );
  }
  notFound();
}

async function LandingAves() {
  const fichas = await getAllFichas();
  const avesCount = fichas.filter((f) => f.grupo === "aves").length;
  const slides = buildHeroSlides(fichas);

  return (
    <>
      <Hero
        slides={slides}
        content={{
          eyebrow: "Humedal del Chirimoyo · Orizaba, Veracruz",
          title: "Las aves del humedal del Chirimoyo",
          lead: "Un catálogo vivo de las aves que habitan la laguna que defendemos: búscalas por forma, color o dónde la viste.",
          primary: { href: "/aves/buscador", label: "Explorar el catálogo" },
          secondary: { href: COMUNIDAD_URL, label: "Conocer la comunidad" },
        }}
      />
      <QueHayAqui avesCount={avesCount} />
      <ElHumedal />
      <CierreCTA />
    </>
  );
}
