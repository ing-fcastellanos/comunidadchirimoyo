"use client";
/* SubirExportForm.tsx — sube un export de WhatsApp (candidatos-admin,
   design.md D1). El archivo se envía de inmediato al elegirlo (mismo criterio
   que PortadaUpload.tsx), a POST /api/candidatos/subir junto con el grupo
   seleccionado. El Route Handler procesa, persiste candidatos si los hay, y
   descarta el archivo — nunca se guarda en ningún lado. */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { getGrupos } from "@/lib/candidatos/types";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

export function SubirExportForm() {
  const router = useRouter();
  const grupos = getGrupos();
  const [grupoId, setGrupoId] = useState(grupos[0]?.id ?? "");
  const [estado, setEstado] = useState<"idle" | "subiendo" | "error">("idle");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !grupoId) return;

    setEstado("subiendo");
    setMensaje(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("grupoId", grupoId);
      const resp = await fetch("/api/candidatos/subir", { method: "POST", body: formData });
      const data = (await resp.json().catch(() => ({}))) as {
        creados?: number;
        mensaje?: string;
        error?: string;
      };

      if (!resp.ok) {
        setEstado("error");
        setMensaje(data.error ?? "No se pudo procesar el export.");
        return;
      }

      setEstado("idle");
      setMensaje(
        data.mensaje ?? (data.creados === 0 ? "No se encontró contenido publicable en los mensajes nuevos." : `${data.creados} candidato(s) nuevo(s).`),
      );
      router.refresh();
    } catch {
      setEstado("error");
      setMensaje("No se pudo subir el archivo. Revisa tu conexión.");
    }
  }

  return (
    <div className="mb-6 rounded-2xl bg-paper-card p-5 shadow-card ring-1 ring-forest/10">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="grupoId" className="mb-1.5 block text-[13px] font-semibold text-ink">
            Grupo de origen
          </label>
          <select
            id="grupoId"
            value={grupoId}
            onChange={(e) => setGrupoId(e.target.value)}
            className={`h-11 rounded-xl border border-forest/15 bg-white px-3.5 text-[14px] text-ink transition-colors hover:border-forest/30 ${FOCO}`}
          >
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
        </div>

        <input ref={inputRef} type="file" accept=".txt,text/plain" onChange={onArchivo} className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={estado === "subiendo" || !grupoId}
          className={`inline-flex h-11 items-center gap-2 rounded-xl bg-forest px-5 text-[14px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(12,90,54,.7)] transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-70 ${FOCO}`}
        >
          {estado === "subiendo" ? (
            <>
              <Icon name="LoaderCircle" className="h-[18px] w-[18px] animate-spin" />
              Analizando…
            </>
          ) : (
            <>
              <Icon name="Upload" className="h-[18px] w-[18px]" />
              Subir export (.txt)
            </>
          )}
        </button>
      </div>

      {mensaje && (
        <p className={`mt-3 text-[13px] font-semibold ${estado === "error" ? "text-[#8f3c25]" : "text-forest-deep"}`}>
          {mensaje}
        </p>
      )}
      <p className="mt-3 text-[12px] text-ink-soft/80">
        Exporta el chat desde WhatsApp (&ldquo;Exportar chat&rdquo;, sin medios) y sube aquí el archivo .txt. El chat
        crudo no se guarda: se analiza y se descarta de inmediato.
      </p>
    </div>
  );
}
