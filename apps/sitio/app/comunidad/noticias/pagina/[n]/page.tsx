/* /comunidad/noticias/pagina/[n] — páginas 2..N del listado (#71). SSG: las
   rutas se pre-generan con generateStaticParams; cualquier `n` fuera de rango da
   404 (dynamicParams=false). La página 1 vive en /comunidad/noticias. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllNoticias } from "@/lib/noticias";
import { paginar, totalPaginas as calcTotalPaginas } from "@/lib/noticias-paginacion";
import { ListadoNoticias } from "@/components/comunidad/ListadoNoticias";

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ n: string }[]> {
  const notas = await getAllNoticias();
  const total = calcTotalPaginas(notas.length);
  // Solo las páginas 2..total (la 1 vive en la ruta base).
  const params: { n: string }[] = [];
  for (let n = 2; n <= total; n++) params.push({ n: String(n) });
  return params;
}

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

  const notas = await getAllNoticias();
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
