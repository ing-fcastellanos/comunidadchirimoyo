import { getAllFichas } from "@/lib/content";
import { buildHeroSlides } from "@/lib/hero";
import { COMUNIDAD_URL } from "@/lib/links";
import { Hero } from "@/components/home/Hero";
import { GruposFauna } from "@/components/home/GruposFauna";
import { ElHumedal } from "@/components/home/ElHumedal";
import { CierreCTA } from "@/components/home/CierreCTA";

/* Hub de fauna (ADR-0024): la home presenta el catálogo como guía de la fauna
   del humedal —no solo aves— y encamina a cada grupo o a la búsqueda. El carrusel
   usa portadas curadas de aves por ahora; las tarjetas se activan por grupo según
   su conteo de fichas. */

export default async function Inicio() {
  const fichas = await getAllFichas();
  const counts = fichas.reduce<Record<string, number>>((acc, f) => {
    acc[f.grupo] = (acc[f.grupo] ?? 0) + 1;
    return acc;
  }, {});
  const slides = buildHeroSlides(fichas);

  return (
    <>
      <Hero
        slides={slides}
        content={{
          eyebrow: "Humedal del Chirimoyo · Orizaba, Veracruz",
          title: "La fauna del humedal del Chirimoyo",
          lead: "Un catálogo vivo de las especies que habitan la laguna que defendemos: aves, anfibios y reptiles del humedal.",
          ctas: [
            { href: "/aves/buscador", label: "Buscar aves", variant: "primary" },
            { href: "/busqueda", label: "Búsqueda general de especies", variant: "primary" },
            { href: COMUNIDAD_URL, label: "Conoce la comunidad", variant: "secondary" },
          ],
        }}
      />
      <GruposFauna counts={counts} />
      <ElHumedal />
      <CierreCTA />
    </>
  );
}
