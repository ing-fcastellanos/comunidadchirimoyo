/* app/(authed)/jornadas/nueva/page.tsx — crear jornada (#141). Server
   Component mínimo: delega al client component JornadaFormulario, atado al
   server action `crearJornada` (redirige a /jornadas/{slug}/editar al
   éxito, D2 de noticias-admin aplicado igual aquí). */
import { JornadaFormulario } from "@/components/jornadas/JornadaFormulario";
import { crearJornada } from "@/lib/jornadas/actions";

export default function NuevaJornadaPage() {
  return <JornadaFormulario modo="crear" accion={crearJornada} />;
}
