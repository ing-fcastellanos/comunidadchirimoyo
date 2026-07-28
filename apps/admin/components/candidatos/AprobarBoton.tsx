"use client";
/* AprobarBoton.tsx — aprueba un candidato (candidatos-admin, design.md D6).
   Para noticia/jornada/evento, la propia Server Action redirige al formulario
   de creación existente ya prellenado — este botón no navega por su cuenta.
   Para logro/aliado, la acción solo marca `aprobado`; router.refresh() revela
   el panel de fragmento JSON que la página de detalle ya sabe mostrar cuando
   `estado === "aprobado"`. */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { aprobarCandidato } from "@/lib/candidatos/actions";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

export function AprobarBoton({ candidatoId }: { candidatoId: string }) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const resultado = await aprobarCandidato(candidatoId);
      if (!resultado.ok) {
        setError(resultado.error ?? "No se pudo aprobar el candidato.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="inline-flex flex-col">
      <button
        type="button"
        onClick={onClick}
        disabled={pendiente}
        className={`inline-flex h-11 items-center gap-2 rounded-xl bg-forest px-5 text-[14px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(12,90,54,.7)] transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-70 ${FOCO}`}
      >
        <Icon name={pendiente ? "LoaderCircle" : "Check"} className={`h-[18px] w-[18px] ${pendiente ? "animate-spin" : ""}`} />
        {pendiente ? "Aprobando…" : "Aprobar"}
      </button>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#8f3c25]">
          <Icon name="TriangleAlert" className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
