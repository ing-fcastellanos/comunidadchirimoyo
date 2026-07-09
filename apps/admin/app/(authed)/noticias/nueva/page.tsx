/* app/(authed)/noticias/nueva/page.tsx — crear noticia (#140). Server
   Component mínimo: delega toda la interacción al client component
   NoticiaFormulario, atado al server action `crearNoticia` (que redirige a
   /noticias/{slug}/editar al éxito, D2). */
import { NoticiaFormulario } from "@/components/noticias/NoticiaFormulario";
import { crearNoticia } from "@/lib/noticias/actions";

export default function NuevaNoticiaPage() {
  return <NoticiaFormulario modo="crear" accion={crearNoticia} />;
}
