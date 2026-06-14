import { getAllFichas } from "@/lib/content";
import { fotoUrl } from "@/lib/fauna-schema";
import { Hero } from "@/components/home/Hero";
import { QueHayAqui } from "@/components/home/QueHayAqui";
import { ElHumedal } from "@/components/home/ElHumedal";
import { CierreCTA } from "@/components/home/CierreCTA";

/* Especie representativa del hero del landing (el avetoro mimetizado). La
   imagen se deriva de su portada curada (fotos[0]) — no se hardcodea. */
const HERO_SLUG = "botaurus-lentiginosus";

export default async function Inicio() {
  const fichas = await getAllFichas();
  const avesCount = fichas.filter((f) => f.grupo === "aves").length;

  const heroFicha =
    fichas.find((f) => f.slug === HERO_SLUG) ?? fichas.find((f) => f.grupo === "aves");
  const portada = heroFicha?.fotos[0];
  const heroImg = heroFicha && portada ? fotoUrl(heroFicha.slug, portada.archivo, "web") : null;
  const heroAlt = portada?.alt ?? "Fauna del humedal del Chirimoyo";

  return (
    <>
      <Hero img={heroImg} alt={heroAlt} />
      <QueHayAqui avesCount={avesCount} />
      <ElHumedal />
      <CierreCTA />
    </>
  );
}
