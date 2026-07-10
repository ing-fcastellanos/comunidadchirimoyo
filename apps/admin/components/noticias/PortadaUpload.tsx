"use client";
/* PortadaUpload.tsx — widget de subida de portada (#142). Vive SOLO en el
   formulario de EDICIÓN de noticias (el nombre del objeto en el bucket
   depende del slug, que no existe al crear, D6 del design). Reemplaza el
   input de texto plano de `portada` de #140 — `portadaAlt` sigue siendo un
   campo de texto aparte, enviado junto con el resto del formulario.

   El upload ocurre de inmediato (POST multipart a
   /api/noticias/{slug}/portada) al elegir un archivo; el Route Handler solo
   sube el archivo y devuelve la ruta (D9) — la persistencia en Firestore
   ocurre al guardar el formulario con el botón "Guardar cambios", como los
   demás campos. */
import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";
const CDN_BASE = process.env.NEXT_PUBLIC_COMUNIDAD_CDN_BASE ?? "https://storage.googleapis.com/comunidad-chirimoyo";

interface Props {
  slug: string;
  portadaInicial: string;
  portadaAltInicial: string;
  errorAlt?: string;
}

export function PortadaUpload({ slug, portadaInicial, portadaAltInicial, errorAlt }: Props) {
  const [portada, setPortada] = useState(portadaInicial);
  const [portadaAlt, setPortadaAlt] = useState(portadaAltInicial);
  const [estado, setEstado] = useState<"idle" | "subiendo" | "error">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function onElegirArchivo() {
    inputRef.current?.click();
  }

  async function onArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo después
    if (!file) return;

    setEstado("subiendo");
    setError("");

    try {
      const formData = new FormData();
      formData.set("file", file);
      const resp = await fetch(`/api/noticias/${slug}/portada`, { method: "POST", body: formData });
      const data = (await resp.json().catch(() => ({}))) as { path?: string; error?: string };

      if (!resp.ok || !data.path) {
        setEstado("error");
        setError(data.error ?? "No se pudo subir la imagen.");
        return;
      }

      setPortada(data.path);
      setEstado("idle");
    } catch {
      setEstado("error");
      setError("No se pudo subir la imagen. Revisa tu conexión.");
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-semibold text-ink">Portada</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onArchivo}
        className="hidden"
      />
      {/* El valor persistido viaja con el resto del formulario, igual que los demás campos. */}
      <input type="hidden" name="portada" value={portada} />

      {estado === "subiendo" ? (
        <div className="flex h-40 items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-forest/20 bg-paper text-[14px] font-semibold text-ink-soft">
          <Icon name="LoaderCircle" className="h-5 w-5 animate-spin text-forest" />
          Subiendo imagen…
        </div>
      ) : portada ? (
        <div className="overflow-hidden rounded-xl ring-1 ring-forest/10">
          <div className="relative aspect-[16/9] w-full bg-mint-wash">
            <Image src={`${CDN_BASE}/${portada}`} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
          </div>
          <div className="flex items-center justify-between gap-3 bg-paper-card px-4 py-3">
            <span className="truncate font-mono text-[12px] text-ink-soft">{portada}</span>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onElegirArchivo}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-forest-deep transition-colors hover:bg-mint-wash ${FOCO}`}
              >
                <Icon name="Upload" className="h-3.5 w-3.5" />
                Reemplazar
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortada("");
                  setPortadaAlt("");
                }}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-[#8f3c25] transition-colors hover:bg-[#f6e1da] ${FOCO}`}
              >
                <Icon name="X" className="h-3.5 w-3.5" />
                Quitar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onElegirArchivo}
          className={`flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${FOCO} ${
            estado === "error" ? "border-[#b5543a]/50 bg-[#f6e1da]/30" : "border-forest/20 bg-paper hover:border-forest/40 hover:bg-mint-wash/30"
          }`}
        >
          <Icon name="ImagePlus" className="h-7 w-7 text-forest/50" />
          <span className="text-[14px] font-semibold text-ink">Subir imagen de portada</span>
          <span className="text-[12px] text-ink-soft/80">JPEG, PNG o WebP · máximo 5MB</span>
        </button>
      )}

      {estado === "error" && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#8f3c25]">
          <Icon name="TriangleAlert" className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-4">
        <label htmlFor="portadaAlt" className="mb-1.5 block text-[14px] font-semibold text-ink">
          Texto alternativo {portada && <span className="text-[#b5543a]" aria-hidden="true">*</span>}
        </label>
        <input
          id="portadaAlt"
          name="portadaAlt"
          value={portadaAlt}
          onChange={(e) => setPortadaAlt(e.target.value)}
          placeholder="Describe la imagen"
          className={`w-full rounded-xl border bg-white px-4 h-[48px] text-[15px] text-ink placeholder:text-ink-soft/45 transition-colors ${FOCO} ${
            errorAlt ? "border-[#b5543a] focus-visible:ring-[#b5543a]/30" : "border-forest/15 hover:border-forest/30"
          }`}
        />
        {errorAlt && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#8f3c25]">
            <Icon name="TriangleAlert" className="h-4 w-4 shrink-0" />
            {errorAlt}
          </p>
        )}
      </div>
    </div>
  );
}
