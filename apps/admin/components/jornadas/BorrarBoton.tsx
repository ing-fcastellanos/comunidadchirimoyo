"use client";
/* BorrarBoton.tsx — borrar jornada con confirmación inline, sin modal (#141),
   espejo de apps/admin/components/noticias/BorrarBoton.tsx. */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { borrarJornada } from "@/lib/jornadas/actions";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

export function BorrarBoton({ slug }: { slug: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, startTransition] = useTransition();

  function onConfirmar() {
    setConfirmando(false);
    startTransition(async () => {
      await borrarJornada(slug);
      router.refresh();
    });
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-[#f6e1da] px-3 py-1.5 text-[13px] font-semibold text-[#8f3c25] ring-1 ring-[#b5543a]/20">
        <span>¿Borrar esta jornada?</span>
        <button
          type="button"
          onClick={onConfirmar}
          className={`rounded-md bg-[#8f3c25] px-2.5 py-1 text-white transition-colors hover:bg-[#7a3220] ${FOCO}`}
        >
          Sí, borrar
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

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      disabled={pendiente}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-[#8f3c25] transition-colors hover:bg-[#f6e1da] disabled:cursor-not-allowed disabled:opacity-60 ${FOCO}`}
    >
      <Icon name="Trash2" className="h-4 w-4" />
      Borrar
    </button>
  );
}
