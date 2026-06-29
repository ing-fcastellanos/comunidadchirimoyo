/* /comunidad/noticias — primera página del listado de noticias (#71). Server
   Component, SSG. Las páginas siguientes viven en /comunidad/noticias/pagina/[n].
   Consume getAllNoticias() (#70): ya viene ordenado desc y sin borradores en prod. */
import type { Metadata } from "next";
import { getAllNoticias } from "@/lib/noticias";
import { paginar } from "@/lib/noticias-paginacion";
import { ListadoNoticias } from "@/components/comunidad/ListadoNoticias";

export const metadata: Metadata = {
  title: "Noticias",
  description:
    "Noticias de la Comunidad del Chirimoyo: jornadas, acciones y vida del humedal de Orizaba.",
  alternates: { canonical: "/comunidad/noticias" },
};

export default async function NoticiasPage() {
  const notas = await getAllNoticias();
  const { slice, totalPaginas } = paginar(notas, 1);

  return (
    <ListadoNoticias
      notas={slice}
      pagina={1}
      totalPaginas={totalPaginas}
      hayNotas={notas.length > 0}
    />
  );
}
