/* page.tsx — landing de chirimoyo.org. Server Component que compone las secciones
   consumiendo content/landing/ vía el data-layer (lib/landing.ts). Sin API.

   NOTA: las secciones "Logros" (línea de tiempo) y "Linktree" están pendientes del
   handoff de diseño v0.dev (CLAUDE.md; tareas 5.5 y 5.6 del change landing-chirimoyo-org).
   Se insertan aquí, en su lugar, cuando lleguen los componentes portados. */
import { Hero } from "@/components/landing/Hero";
import { ElCaso } from "@/components/landing/ElCaso";
import { QueHacemos } from "@/components/landing/QueHacemos";
import { LineaTiempo } from "@/components/landing/LineaTiempo";
import { GaleriaTeaser } from "@/components/landing/GaleriaTeaser";
import { Linktree } from "@/components/landing/Linktree";
import { Donaciones } from "@/components/landing/Donaciones";
import { AliadosPreview } from "@/components/landing/AliadosPreview";
import { CierreCTA } from "@/components/landing/CierreCTA";
import {
  getLucha,
  getActividades,
  getLogros,
  getEnlaces,
  getDonaciones,
  getAliados,
  getHeroSlides,
  getGaleria,
  getGaleriaFotos,
  mediaUrl,
} from "@/lib/landing";

/* Metadata propia del landing (no hereda solo el default del layout). Título
   absoluto para que el home no lleve el sufijo del template, y canónico al
   dominio único (ADR-0023). */
export const metadata = {
  title: {
    absolute: "Comunidad Chirimoyo — En defensa del humedal de Chirimoyo",
  },
  description:
    "Vecinos y ecologistas en defensa del humedal de Chirimoyo, en el norte de Orizaba, Veracruz. Conoce la lucha, súmate a las jornadas y explora la fauna del humedal.",
  alternates: { canonical: "/" },
};

export default async function Landing() {
  const [
    lucha,
    heroSlides,
    actividades,
    logros,
    galeria,
    galeriaFotos,
    enlaces,
    donaciones,
    aliados,
  ] = await Promise.all([
    getLucha(),
    getHeroSlides(),
    getActividades(),
    getLogros(),
    getGaleria(),
    getGaleriaFotos(),
    getEnlaces(),
    getDonaciones(),
    getAliados(),
  ]);

  /* Datos estructurados Organization (JSON-LD). Estático en build; las redes
     salen de enlaces.json para no duplicar la fuente de verdad. */
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Comunidad Chirimoyo",
    url: "https://chirimoyo.org",
    logo: "https://chirimoyo.org/logo-chirimoyo.png",
    sameAs: enlaces.redes.map((red) => red.url),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Hero titulo={lucha.titulo} resumen={lucha.resumen} slides={heroSlides} />
      <ElCaso
        secciones={lucha.secciones}
        fotoUrl={mediaUrl(lucha.casoFoto)}
        fotoAlt={lucha.casoFotoAlt}
      />
      <QueHacemos data={actividades} />
      <LineaTiempo data={logros} />
      <GaleriaTeaser
        titulo={galeria.titulo}
        resumen={galeria.resumen}
        fotos={galeriaFotos}
      />
      <Donaciones data={donaciones} />
      <AliadosPreview data={aliados} />
      <Linktree data={enlaces} />
      <CierreCTA />
    </>
  );
}
