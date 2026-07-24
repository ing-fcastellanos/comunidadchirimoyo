"use client";
/* AlternarSuscripcionBoton.tsx — botón para suscribir/desuscribir manualmente
   (design.md D6): el complemento natural de mostrar el estado — sin esto,
   staff no podría dar de baja a alguien que llama por teléfono en vez de usar
   el link del correo. Mismo patrón que AlternarEstadoBoton de noticias. */
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { alternarSuscripcion } from "@/lib/voluntarios/actions";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

export function AlternarSuscripcionBoton({
  voluntarioId,
  suscrito,
}: {
  voluntarioId: string;
  suscrito: boolean;
}) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      await alternarSuscripcion(voluntarioId, !suscrito);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pendiente}
      className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[14px] font-semibold ring-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${FOCO} ${
        suscrito
          ? "text-[#8f3c25] ring-[#e8c3b6] hover:bg-[#f6e1da]"
          : "text-forest-deep ring-forest/20 hover:bg-mint-wash"
      }`}
    >
      <Icon name={suscrito ? "MailX" : "MailCheck"} className="h-4 w-4" />
      {pendiente ? "…" : suscrito ? "Desuscribir manualmente" : "Suscribir al resumen semanal"}
    </button>
  );
}
