/* hero.ts — slides del carrusel del hero. Comparte la lista curada de especies
   (aves por ahora) entre el hub de fauna (/) y el landing de aves (/aves). La
   imagen de cada slide se deriva de la portada curada (fotos[0]); se hardcodea la
   lista de slugs, no archivos de imagen. */
import { fotoUrl, type FichaEspecie } from "./fauna-schema";
import type { HeroSlide } from "@/components/home/Hero";

/* Especies del carrusel del hero, en orden. */
const HERO_SLUGS = [
  "botaurus-lentiginosus", // Avetoro Norteño
  "megaceryle-alcyon",     // Martín Pescador Norteño
  "egretta-thula",         // Garza Dedos Dorados
  "dendrocygna-autumnalis", // Pijije Alas Blancas
];

/** Construye los slides del hero a partir de las fichas cargadas en build. */
export function buildHeroSlides(fichas: FichaEspecie[]): HeroSlide[] {
  return HERO_SLUGS.map((slug) => {
    const f = fichas.find((x) => x.slug === slug);
    const portada = f?.fotos[0];
    if (!f || !portada) return null;
    return {
      src: fotoUrl(f.slug, portada.archivo, "web"),
      alt: portada.alt,
      nombre: f.nombreComun,
    };
  }).filter((s): s is HeroSlide => s !== null);
}
