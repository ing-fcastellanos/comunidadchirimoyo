/* app/(authed)/noticias/[slug]/editar/page.tsx — editar noticia (#140).
   Server Component: lee la noticia (SIN filtrar por estado — el admin ve
   borradores), 404 si no existe. El server action se ata al slug con
   `.bind(null, slug)` antes de pasarlo al client component. */
import { notFound } from "next/navigation";
import { NoticiaFormulario } from "@/components/noticias/NoticiaFormulario";
import { actualizarNoticia } from "@/lib/noticias/actions";
import { getNoticiaAdmin } from "@/lib/noticias/read";

export const dynamic = "force-dynamic";

export default async function EditarNoticiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const noticia = await getNoticiaAdmin(slug);
  if (!noticia) notFound();

  return <NoticiaFormulario modo="editar" noticia={noticia} accion={actualizarNoticia.bind(null, slug)} />;
}
