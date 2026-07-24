"use client";
/* FormularioContacto.tsx — agrega una entrada al log de contactos. Mismo
   patrón que NoticiaFormulario: useActionState (React 19) contra el server
   action ya bindeado con el ID del voluntario (page.tsx hace
   `agregarContacto.bind(null, voluntario.id)`). */
import { useActionState, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import type { ContactoActionState } from "@/lib/voluntarios/actions";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";
const ESTADO_INICIAL: ContactoActionState = { ok: false };

export function FormularioContacto({
  accion,
}: {
  accion: (prevState: ContactoActionState, formData: FormData) => Promise<ContactoActionState>;
}) {
  const [estado, formAction, enviando] = useActionState(accion, ESTADO_INICIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <form ref={formRef} action={formAction} className="mb-6 rounded-2xl bg-paper-card p-5 shadow-card ring-1 ring-forest/10">
      <label htmlFor="nota" className="mb-2 block text-[13px] font-semibold text-ink-soft">
        Registrar un contacto nuevo
      </label>
      <textarea
        id="nota"
        name="nota"
        rows={3}
        required
        placeholder="¿Qué se acordó? ¿Cómo se le contactó?"
        className={`w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-[14px] text-ink placeholder:text-ink-soft/50 ${FOCO}`}
      />
      {estado.error && <p className="mt-1.5 text-[13px] font-semibold text-[#8f3c25]">{estado.error}</p>}
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={enviando}
          className={`inline-flex h-10 items-center gap-2 rounded-lg bg-forest px-4 text-[14px] font-bold text-white transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60 ${FOCO}`}
        >
          <Icon name="Plus" className="h-4 w-4" />
          {enviando ? "Guardando…" : "Guardar contacto"}
        </button>
      </div>
    </form>
  );
}
