/* page.tsx — landing de chirimoyo.org. Server Component que compone las secciones
   consumiendo content/landing/ vía el data-layer (lib/landing.ts). Sin API.

   "Qué hacemos" y la "Línea de tiempo de logros" viven ahora en /comunidad
   (reorganizar-comunidad, #19a); aquí queda un enlace teaser hacia esa página. */
import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { ElCaso } from "@/components/landing/ElCaso";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { GaleriaTeaser } from "@/components/landing/GaleriaTeaser";
import { Linktree } from "@/components/landing/Linktree";
import { Donaciones } from "@/components/landing/Donaciones";
import { AliadosPreview } from "@/components/landing/AliadosPreview";
import { CierreCTA } from "@/components/landing/CierreCTA";
import {
  getLucha,
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
    galeria,
    galeriaFotos,
    enlaces,
    donaciones,
    aliados,
  ] = await Promise.all([
    getLucha(),
    getHeroSlides(),
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
      <Section className="py-14 sm:py-16">
        <Link
          href="/comunidad"
          className="group flex flex-col gap-4 rounded-2xl bg-paper-card p-7 shadow-card ring-1 ring-forest/[0.07] transition-all hover:-translate-y-0.5 hover:ring-forest/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div className="max-w-2xl">
            <div className="text-[12px] font-bold uppercase tracking-[0.22em] text-forest">
              Conoce a la comunidad
            </div>
            <p className="mt-2 font-serif text-[22px] font-semibold leading-tight text-forest-deep text-balance sm:text-[26px]">
              Qué hacemos, nuestra historia y lo que hemos logrado juntos
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 text-[16px] font-semibold text-forest-deep">
            Ir a la comunidad
            <Icon name="ArrowRight" className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </Section>
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
