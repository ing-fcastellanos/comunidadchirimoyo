import { getAllFichas } from "@/lib/content";
import { fotoUrl } from "@/lib/fauna-schema";
import { Hero } from "@/components/home/Hero";
import { QueHayAqui } from "@/components/home/QueHayAqui";
import { ElHumedal } from "@/components/home/ElHumedal";
import { CierreCTA } from "@/components/home/CierreCTA";

/* Especies del carrusel del hero, en orden. La imagen de cada una se deriva de
   su portada curada (fotos[0]) — se hardcodea la lista de slugs, no archivos. */
const HERO_SLUGS = [
  "botaurus-lentiginosus", // Avetoro Norteño
  "megaceryle-alcyon",     // Martín Pescador Norteño
  "egretta-thula",         // Garza Dedos Dorados
  "dendrocygna-autumnalis", // Pijije Alas Blancas
];

export default async function Inicio() {
  const fichas = await getAllFichas();
  const avesCount = fichas.filter((f) => f.grupo === "aves").length;

  const slides = HERO_SLUGS.map((slug) => {
    const f = fichas.find((x) => x.slug === slug);
    const portada = f?.fotos[0];
    if (!f || !portada) return null;
    return {
      src: fotoUrl(f.slug, portada.archivo, "web"),
      alt: portada.alt,
      nombre: f.nombreComun,
    };
  }).filter((s): s is { src: string; alt: string; nombre: string } => s !== null);

  return (
    <>
      <Hero slides={slides} />
      <QueHayAqui avesCount={avesCount} />
      <ElHumedal />
      <CierreCTA />
    </>
  );
}
