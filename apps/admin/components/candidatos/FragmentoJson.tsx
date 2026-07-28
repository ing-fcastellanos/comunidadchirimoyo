"use client";
/* FragmentoJson.tsx — fragmento JSON copiable para logro/aliado
   (candidatos-admin, design.md D6). El humano lo pega a mano en
   content/landing/{logros,aliados}.json y abre su propio PR — sin CRUD nuevo
   para estos dos tipos (ADR-0004). */
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

export function FragmentoJson({ fragmento, archivoDestino }: { fragmento: string; archivoDestino: string }) {
  const [copiado, setCopiado] = useState(false);

  async function onCopiar() {
    try {
      await navigator.clipboard.writeText(fragmento);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el usuario puede seleccionar el texto a mano.
    }
  }

  return (
    <div className="rounded-xl border border-forest/15 bg-paper p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[13px] font-bold uppercase tracking-wide text-forest">
          Fragmento para <span className="font-mono normal-case">{archivoDestino}</span>
        </p>
        <button
          type="button"
          onClick={onCopiar}
          className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-forest-deep transition-colors hover:bg-mint-wash ${FOCO}`}
        >
          <Icon name={copiado ? "Check" : "Copy"} className="h-4 w-4" />
          {copiado ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-white p-3.5 text-[13px] leading-relaxed text-ink ring-1 ring-forest/10">
        {fragmento}
      </pre>
      <p className="mt-2 text-[12px] text-ink-soft/80">
        Completa los campos PLACEHOLDER, pégalo en el arreglo correspondiente y abre tu PR — este tipo no tiene edición
        directa desde el admin.
      </p>
    </div>
  );
}
