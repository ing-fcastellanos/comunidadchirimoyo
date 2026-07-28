"use client";
/* TonoSelector.tsx — selector de tono + redacción con IA para candidatos de
   tipo noticia (candidatos-admin, design.md D4/D6). El tono se elige AQUÍ,
   al interactuar con el candidato — nunca durante la subida en lote. */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { redactarConTono } from "@/lib/candidatos/actions";
import { TONOS, type TonoNoticia } from "@/lib/candidatos/types";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

export function TonoSelector({
  candidatoId,
  tonoInicial,
  redaccionInicial,
}: {
  candidatoId: string;
  tonoInicial: TonoNoticia | null;
  redaccionInicial: string | null;
}) {
  const router = useRouter();
  const [tono, setTono] = useState<TonoNoticia | null>(tonoInicial);
  const [redaccion, setRedaccion] = useState(redaccionInicial ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  function elegirTono(t: TonoNoticia) {
    setTono(t);
    setError(null);
    startTransition(async () => {
      const resultado = await redactarConTono(candidatoId, t);
      if (!resultado.ok) {
        setError(resultado.error ?? "No se pudo redactar.");
        return;
      }
      setRedaccion(resultado.redaccion ?? "");
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-forest/15 bg-paper p-4">
      <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-forest">Tono de redacción</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {TONOS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => elegirTono(t.id)}
            disabled={pendiente}
            title={t.descripcion}
            className={`flex items-center gap-2 rounded-xl border-2 px-3.5 py-2.5 text-left text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${FOCO} ${
              tono === t.id ? "border-forest bg-mint-wash text-forest-deep" : "border-forest/15 text-ink hover:border-forest/30"
            }`}
          >
            {t.etiqueta}
          </button>
        ))}
      </div>

      {pendiente && (
        <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
          <Icon name="LoaderCircle" className="h-4 w-4 animate-spin" />
          Redactando con IA…
        </p>
      )}
      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#8f3c25]">
          <Icon name="TriangleAlert" className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      {!pendiente && redaccion && (
        <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-forest/10">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Redacción sugerida</p>
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink">{redaccion}</p>
        </div>
      )}
    </div>
  );
}
