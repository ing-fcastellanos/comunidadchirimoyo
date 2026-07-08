import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllFichas } from "@/lib/content";
import { fichaToEspecie } from "@/lib/search";
import { BuscadorGeneral } from "@/components/search/BuscadorGeneral";

/* /busqueda — buscador GENERAL sobre toda la fauna (aves + anfibios + reptiles),
   con los filtros del núcleo común del esquema. Estático y 100% en cliente
   (datos embebidos en build, sin endpoint; ADR-0005/0006). El buscador
   especializado de aves vive en /aves/buscador. Ver #85. */

export const metadata: Metadata = {
  title: "Buscar en toda la fauna",
  description:
    "Busca entre todas las especies del humedal del Chirimoyo —aves, anfibios y reptiles— por nombre, grupo, taxonomía, presencia o estado de conservación.",
};

export default async function BusquedaPage() {
  const especies = (await getAllFichas()).map(fichaToEspecie);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20">
      <div className="pt-8 sm:pt-10">
        <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest-deep">
          Laguna del Chirimoyo
        </p>
        <h1 className="mt-2 font-serif text-[clamp(28px,4vw,42px)] font-semibold leading-[1.05] text-forest-deep">
          Busca en toda la fauna
        </h1>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink/75">
          Explora las{" "}
          <strong className="font-semibold text-forest-deep">{especies.length} especies</strong>{" "}
          del humedal —aves, anfibios y reptiles— por nombre, grupo, taxonomía, presencia o conservación.
        </p>
      </div>

      <Suspense fallback={null}>
        <BuscadorGeneral especies={especies} />
      </Suspense>
    </div>
  );
}
