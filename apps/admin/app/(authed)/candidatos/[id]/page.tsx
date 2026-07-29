/* app/(authed)/candidatos/[id]/page.tsx — detalle/revisión de un candidato
   (candidatos-admin). Server Component: la interactividad (tono/redacción,
   aprobar, descartar) vive en los client components hijos. */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { TipoBadge } from "@/components/candidatos/TipoBadge";
import { EstadoBadge } from "@/components/candidatos/EstadoBadge";
import { TonoSelector } from "@/components/candidatos/TonoSelector";
import { AprobarBoton } from "@/components/candidatos/AprobarBoton";
import { DescartarBoton } from "@/components/candidatos/DescartarBoton";
import { RevertirBoton } from "@/components/candidatos/RevertirBoton";
import { FragmentoJson } from "@/components/candidatos/FragmentoJson";
import { getCandidatoAdmin } from "@/lib/candidatos/read";
import { armarFragmentoJson } from "@/lib/candidatos/fragmento";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

export default async function CandidatoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidato = await getCandidatoAdmin(id);
  if (!candidato) notFound();

  const archivoDestino = candidato.tipo === "logro" ? "content/landing/logros.json" : "content/landing/aliados.json";

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center gap-2 text-[13px] text-ink-soft">
        <Link href="/candidatos" className={`font-semibold text-forest hover:underline ${FOCO} rounded`}>
          Candidatos
        </Link>
        <Icon name="ChevronRight" className="h-3.5 w-3.5" />
        <span>Detalle</span>
      </div>

      <header className="mb-6 flex flex-wrap items-center gap-2">
        <TipoBadge tipo={candidato.tipo} />
        <EstadoBadge estado={candidato.estado} />
        <span className="text-[13px] text-ink-soft">
          {candidato.grupoNombre}
          {candidato.fechaMensaje && ` · ${candidato.fechaMensaje}`}
        </span>
      </header>

      <div className="mb-6 rounded-2xl bg-paper-card p-6 shadow-card ring-1 ring-forest/10 sm:p-8">
        <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Resumen extraído</p>
        <p className="text-[16px] leading-relaxed text-ink">{candidato.resumen}</p>
        <p className="mt-3 text-[13px] text-ink-soft">Confianza de la IA: {candidato.confianza}</p>
      </div>

      {candidato.tipo === "noticia" && (
        <div className="mb-6">
          <TonoSelector candidatoId={candidato.id} tonoInicial={candidato.tono} redaccionInicial={candidato.redaccion} />
        </div>
      )}

      {candidato.estado === "aprobado" && (candidato.tipo === "logro" || candidato.tipo === "aliado") && (
        <div className="mb-6">
          <FragmentoJson fragmento={armarFragmentoJson(candidato)} archivoDestino={archivoDestino} />
        </div>
      )}

      {candidato.estado === "pendiente" ? (
        <div className="flex items-center gap-3">
          <AprobarBoton candidatoId={candidato.id} />
          <DescartarBoton candidatoId={candidato.id} />
        </div>
      ) : (
        <RevertirBoton candidatoId={candidato.id} />
      )}
    </main>
  );
}
