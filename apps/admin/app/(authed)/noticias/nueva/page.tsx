/* app/(authed)/noticias/nueva/page.tsx — crear noticia (#140). Server
   Component mínimo: delega toda la interacción al client component
   NoticiaFormulario, atado al server action `crearNoticia` (que redirige a
   /noticias/{slug}/editar al éxito, D2). Acepta prellenado por query string
   (resumen, cuerpo, fecha) al llegar desde un candidato de WhatsApp aprobado
   (candidatos-admin, design.md D6) — sin cambiar el contrato de creación. */
import { NoticiaFormulario } from "@/components/noticias/NoticiaFormulario";
import { crearNoticia } from "@/lib/noticias/actions";

export default async function NuevaNoticiaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

  const prellenado = {
    resumen: str(sp.resumen),
    cuerpo: str(sp.cuerpo),
    fecha: str(sp.fecha),
  };

  return <NoticiaFormulario modo="crear" accion={crearNoticia} prellenado={prellenado} />;
}
