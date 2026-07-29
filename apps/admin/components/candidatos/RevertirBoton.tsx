"use client";
/* RevertirBoton.tsx — devuelve un candidato ya aprobado/descartado a
   `pendiente` (candidatos-admin), para corregir un clic equivocado sin
   tener que volver a subir el export. `compacto`: versión reducida para
   usar inline en la fila del listado. */
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { revertirAPendiente } from "@/lib/candidatos/actions";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

export function RevertirBoton({ candidatoId, compacto = false }: { candidatoId: string; compacto?: boolean }) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      await revertirAPendiente(candidatoId);
      router.refresh();
    });
  }

  const tamano = compacto ? "h-9 gap-1.5 px-3 text-[13px]" : "h-11 gap-2 px-5 text-[14px]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pendiente}
      title="Volver a pendiente"
      className={`inline-flex items-center rounded-xl text-ink-soft transition-colors hover:bg-mint-wash disabled:cursor-not-allowed disabled:opacity-60 ${tamano} ${FOCO}`}
    >
      <Icon name="RotateCcw" className={compacto ? "h-4 w-4" : "h-[18px] w-[18px]"} />
      {pendiente ? "…" : "Volver a pendiente"}
    </button>
  );
}
