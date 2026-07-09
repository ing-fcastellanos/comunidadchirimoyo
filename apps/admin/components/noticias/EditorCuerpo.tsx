"use client";
/* EditorCuerpo.tsx — campo `cuerpo` con tabs "Editar"/"Vista previa" (#140,
   D8). Textarea no controlado (el valor viaja por FormData al enviar el
   formulario, igual que los demás campos de Campo.tsx) + un estado local solo
   para reflejar lo tecleado en la vista previa en vivo con <Markdown>. */
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Markdown } from "@/components/ui/Markdown";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

export function EditorCuerpo({ defaultValue = "", error }: { defaultValue?: string; error?: string }) {
  const [cuerpo, setCuerpo] = useState(defaultValue);
  const [tab, setTab] = useState<"editar" | "preview">("editar");

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor="cuerpo" className="text-[14px] font-semibold text-ink">
          Cuerpo <span className="text-[#b5543a]" aria-hidden="true">*</span>
        </label>
        <div className="flex rounded-lg bg-paper p-1 ring-1 ring-forest/10">
          <button
            type="button"
            onClick={() => setTab("editar")}
            className={`rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors ${FOCO} ${
              tab === "editar" ? "bg-white text-forest-deep shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors ${FOCO} ${
              tab === "preview" ? "bg-white text-forest-deep shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            Vista previa
          </button>
        </div>
      </div>

      <div hidden={tab !== "editar"}>
        <textarea
          id="cuerpo"
          name="cuerpo"
          rows={16}
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-3 font-mono text-[14px] leading-relaxed text-ink transition-colors resize-y ${FOCO} ${
            error ? "border-[#b5543a]" : "border-forest/15 hover:border-forest/30"
          }`}
          placeholder={"## Un subtítulo\n\nEscribe en markdown: negrita con **así**, listas con -, citas con >."}
        />
      </div>

      {tab === "preview" && (
        <div className="min-h-[280px] rounded-xl border border-forest/15 bg-white px-5 py-4">
          {cuerpo.trim() ? (
            <Markdown>{cuerpo}</Markdown>
          ) : (
            <p className="text-[14px] text-ink-soft/70">Nada que previsualizar todavía.</p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#8f3c25]">
          <Icon name="TriangleAlert" className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      <p className="mt-1.5 text-[13px] text-ink-soft/80">
        Sin HTML crudo: solo markdown (encabezados, negrita, listas, citas, tablas, imágenes con URL absoluta).
      </p>
    </div>
  );
}
