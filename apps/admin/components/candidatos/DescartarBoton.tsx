"use client";
/* DescartarBoton.tsx — descarta un candidato con confirmación inline, sin
   modal (candidatos-admin), espejo de components/noticias/BorrarBoton.tsx.
   `compacto`: versión reducida para usar inline en la fila del listado. */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { descartarCandidato } from "@/lib/candidatos/actions";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

export function DescartarBoton({ candidatoId, compacto = false }: { candidatoId: string; compacto?: boolean }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, startTransition] = useTransition();

  function onConfirmar() {
    setConfirmando(false);
    startTransition(async () => {
      await descartarCandidato(candidatoId);
      router.refresh();
    });
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#f6e1da] px-3 py-1.5 text-[13px] font-semibold text-[#8f3c25] ring-1 ring-[#b5543a]/20">
        <span>¿Descartar?</span>
        <button
          type="button"
          onClick={onConfirmar}
          className={`rounded-md bg-[#8f3c25] px-2.5 py-1 text-white transition-colors hover:bg-[#7a3220] ${FOCO}`}
        >
          Sí
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className={`rounded-md px-2 py-1 text-[#8f3c25] transition-colors hover:bg-[#8f3c25]/10 ${FOCO}`}
        >
          Cancelar
        </button>
      </div>
    );
  }

  const tamano = compacto ? "h-9 gap-1.5 px-3 text-[13px]" : "h-11 gap-2 px-5 text-[14px]";

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      disabled={pendiente}
      className={`inline-flex items-center rounded-xl font-semibold text-[#8f3c25] transition-colors hover:bg-[#f6e1da] disabled:cursor-not-allowed disabled:opacity-60 ${tamano} ${FOCO}`}
    >
      <Icon name="X" className={compacto ? "h-4 w-4" : "h-[18px] w-[18px]"} />
      Descartar
    </button>
  );
}
