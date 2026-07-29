/* app/(authed)/candidatos/page.tsx — listado de candidatos extraídos de
   WhatsApp (candidatos-admin). Server Component: lee filtros + página de la
   query string (mismo patrón que voluntarios/page.tsx) y consulta Firestore
   ya filtrado/paginado (a diferencia de noticias/jornadas/voluntarios,
   candidatos sí pagina — puede acumular cientos por grupo). Default de
   estado: "pendiente" — es una cola de revisión, no un archivo histórico. */
import { Icon } from "@/components/ui/Icon";
import { Fila } from "@/components/candidatos/Fila";
import { FiltrosBar } from "@/components/candidatos/FiltrosBar";
import { Paginador } from "@/components/candidatos/Paginador";
import { SubirExportForm } from "@/components/candidatos/SubirExportForm";
import { getAllCandidatosAdmin } from "@/lib/candidatos/read";
import type { EstadoCandidato, TipoCandidato } from "@/lib/candidatos/types";

export const dynamic = "force-dynamic";

const TIPOS_VALIDOS: readonly TipoCandidato[] = ["noticia", "jornada", "evento", "logro", "aliado"];
const ESTADOS_VALIDOS: readonly EstadoCandidato[] = ["pendiente", "aprobado", "descartado"];

function comoTipo(v: string | undefined): TipoCandidato | "todos" {
  return TIPOS_VALIDOS.includes(v as TipoCandidato) ? (v as TipoCandidato) : "todos";
}

function comoEstado(v: string | undefined): EstadoCandidato | "todos" {
  return ESTADOS_VALIDOS.includes(v as EstadoCandidato) ? (v as EstadoCandidato) : v === "todos" ? "todos" : "pendiente";
}

export default async function CandidatosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tipo = comoTipo(typeof sp.tipo === "string" ? sp.tipo : undefined);
  const grupoId = typeof sp.grupoId === "string" ? sp.grupoId : "todos";
  const estado = comoEstado(typeof sp.estado === "string" ? sp.estado : undefined);
  const pagina = Number(sp.pagina) || 1;

  const { candidatos, paginaActual, totalPaginas, total } = await getAllCandidatosAdmin({
    tipo,
    grupoId,
    estado,
    pagina,
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <div className="mb-0.5 text-[12px] font-bold uppercase tracking-[0.22em] text-forest">Panel · Admin</div>
        <h1 className="font-serif text-[32px] font-semibold leading-tight text-forest-deep">Candidatos</h1>
        <p className="mt-1 text-[14px] text-ink-soft">
          {total} candidato(s) con estos filtros · extraídos de exports de WhatsApp
        </p>
      </header>

      <SubirExportForm />

      <FiltrosBar tipo={tipo} grupoId={grupoId} estado={estado} />

      <div className="overflow-x-auto rounded-2xl bg-paper-card p-2 shadow-card ring-1 ring-forest/10 sm:p-3">
        {candidatos.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-mint-wash text-forest-deep ring-1 ring-forest/10">
              <Icon name="MessageSquareText" className="h-6 w-6" />
            </span>
            <p className="mt-4 text-[15px] text-ink-soft">Ningún candidato coincide con estos filtros.</p>
          </div>
        ) : (
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-forest/15">
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Resumen</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Tipo</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Grupo</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Confianza</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Estado</th>
                <th className="px-3 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&_td]:px-3">
              {candidatos.map((c) => (
                <Fila key={c.id} candidato={c} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Paginador paginaActual={paginaActual} totalPaginas={totalPaginas} tipo={tipo} grupoId={grupoId} estado={estado} />
    </main>
  );
}
