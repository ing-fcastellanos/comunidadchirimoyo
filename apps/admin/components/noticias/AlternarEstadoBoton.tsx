"use client";
/* AlternarEstadoBoton.tsx — botón "Publicar"/"Despublicar" (#140). Llama al
   server action `alternarEstado` (que ya decide internamente si fija
   publishedAt y si dispara la revalidación del sitio, ver design.md D4/D5) y
   refresca la página con router.refresh() para reflejar el nuevo estado —
   se usa tanto en la lista (components/noticias/Fila más abajo) como en el
   encabezado de la página de edición. */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { alternarEstado } from "@/lib/noticias/actions";
import type { EstadoNota } from "@/lib/noticias/types";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

export function AlternarEstadoBoton({
  slug,
  estado,
  className = "",
}: {
  slug: string;
  estado: EstadoNota;
  className?: string;
}) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [aviso, setAviso] = useState<string | undefined>();
  const publicado = estado === "publicado";

  function onClick() {
    startTransition(async () => {
      const resultado = await alternarEstado(slug, publicado ? "borrador" : "publicado");
      setAviso(resultado.avisoRevalidacion);
      router.refresh();
    });
  }

  return (
    <div className="inline-flex flex-col">
      <button
        type="button"
        onClick={onClick}
        disabled={pendiente}
        className={`inline-flex h-9 w-[132px] shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-forest-deep transition-colors hover:bg-mint-wash disabled:cursor-not-allowed disabled:opacity-60 ${FOCO} ${className}`}
      >
        <Icon name={publicado ? "EyeOff" : "Upload"} className="h-4 w-4" />
        {pendiente ? "…" : publicado ? "Despublicar" : "Publicar"}
      </button>
      {aviso && <p className="mt-1 max-w-[220px] text-[12px] text-ink-soft/80">{aviso}</p>}
    </div>
  );
}
