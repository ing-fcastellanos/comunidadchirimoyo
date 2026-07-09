/* /comunidad/noticias/pagina/[n] — páginas 2..N del listado (#71). DINÁMICO
   (Fase 6, #136): lee Firestore en runtime (`getAllNoticiasCached`) con
   revalidación; `force-dynamic` para que el build NO acceda a Firestore. Un `n`
   fuera de rango o no numérico da 404. La página 1 vive en /comunidad/noticias. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllNoticiasCached } from "@/lib/noticias-cache";
import { paginar } from "@/lib/noticias-paginacion";
import { ListadoNoticias } from "@/components/comunidad/ListadoNoticias";

export const dynamic = "force-dynamic";

function parsePagina(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 2 ? n : null; // la 1 es la ruta base
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `Noticias · Página ${n}`,
    alternates: { canonical: `/comunidad/noticias/pagina/${n}` },
  };
}

export default async function NoticiasPaginaPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const pagina = parsePagina(n);
  if (pagina === null) notFound();

  const notas = await getAllNoticiasCached();
  const { slice, totalPaginas } = paginar(notas, pagina);
  if (pagina > totalPaginas) notFound();

  return (
    <ListadoNoticias
      notas={slice}
      pagina={pagina}
      totalPaginas={totalPaginas}
      hayNotas={notas.length > 0}
    />
  );
}
