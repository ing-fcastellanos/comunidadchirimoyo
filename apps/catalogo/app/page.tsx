import { getAllFichas } from "@/lib/content";
import { Hero } from "@/components/home/Hero";
import { QueHayAqui } from "@/components/home/QueHayAqui";
import { ElHumedal } from "@/components/home/ElHumedal";
import { CierreCTA } from "@/components/home/CierreCTA";

export default async function Inicio() {
  const fichas = await getAllFichas();
  const avesCount = fichas.filter((f) => f.grupo === "aves").length;

  return (
    <>
      <Hero />
      <QueHayAqui avesCount={avesCount} />
      <ElHumedal />
      <CierreCTA />
    </>
  );
}
