/* app/(authed)/jornadas/[slug]/editar/page.tsx — editar jornada (#141).
   Server Component: lee la jornada, 404 si no existe. El server action se
   ata al slug con `.bind(null, slug)` antes de pasarlo al client component. */
import { notFound } from "next/navigation";
import { JornadaFormulario } from "@/components/jornadas/JornadaFormulario";
import { actualizarJornada } from "@/lib/jornadas/actions";
import { getJornadaAdmin } from "@/lib/jornadas/read";

export const dynamic = "force-dynamic";

export default async function EditarJornadaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const jornada = await getJornadaAdmin(slug);
  if (!jornada) notFound();

  return <JornadaFormulario modo="editar" jornada={jornada} accion={actualizarJornada.bind(null, slug)} />;
}
