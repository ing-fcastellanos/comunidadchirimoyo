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

  return (
    <>
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
