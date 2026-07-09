/* /comunidad/noticias — primera página del listado de noticias (#71). Server
   Component DINÁMICO (Fase 6, #136): lee las notas de Firestore en runtime
   (`getAllNoticiasCached`, ya ordenado desc y sin borradores en prod) con
   revalidación. `force-dynamic` para que el build NO acceda a Firestore. Las
   páginas siguientes viven en /comunidad/noticias/pagina/[n]. */
import type { Metadata } from "next";
import { getAllNoticiasCached } from "@/lib/noticias-cache";
import { paginar } from "@/lib/noticias-paginacion";
import { ListadoNoticias } from "@/components/comunidad/ListadoNoticias";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Noticias",
  description:
    "Noticias de la Comunidad del Chirimoyo: jornadas, acciones y vida del humedal de Orizaba.",
  alternates: { canonical: "/comunidad/noticias" },
};

export default async function NoticiasPage() {
  const notas = await getAllNoticiasCached();
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
