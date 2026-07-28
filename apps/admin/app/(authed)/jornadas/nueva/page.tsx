/* app/(authed)/jornadas/nueva/page.tsx — crear jornada (#141). Server
   Component mínimo: delega al client component JornadaFormulario, atado al
   server action `crearJornada` (redirige a /jornadas/{slug}/editar al
   éxito, D2 de noticias-admin aplicado igual aquí). Acepta prellenado por
   query string (titulo, descripcion, fecha, kind) al llegar desde un
   candidato de WhatsApp aprobado (candidatos-admin, design.md D6) — sin
   cambiar el contrato de creación. */
import { JornadaFormulario } from "@/components/jornadas/JornadaFormulario";
import { crearJornada } from "@/lib/jornadas/actions";

export default async function NuevaJornadaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

  // El candidato solo trae un "resumen" (sin título/descripción separados,
  // ver lib/candidatos/prellenado.ts) — se usa como punto de partida para
  // ambos campos; el staff los ajusta antes de guardar.
  const resumen = str(sp.resumen);
  const prellenado = {
    titulo: resumen,
    descripcion: resumen,
    fecha: str(sp.fecha),
    kind: sp.kind === "evento" ? ("evento" as const) : undefined,
  };

  return <JornadaFormulario modo="crear" accion={crearJornada} prellenado={prellenado} />;
}
