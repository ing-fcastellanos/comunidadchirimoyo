"use client";
/* error.tsx — pantalla de error inesperado de chirimoyo.org. Client Component
   (requisito de Next: usa el callback reset()). Hereda Header/Footer del layout. */
import {
  BadgeEstado,
  BloqueError,
  BotonPrimario,
  EnlaceTexto,
  FlechaInline,
  IlustracionHumedal,
} from "@/components/error/PantallasError";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <BloqueError aria-label="Ocurrió un error inesperado">
      <IlustracionHumedal acento="var(--color-terra)" variante="enredada" />

      <BadgeEstado tono="terra">Error inesperado</BadgeEstado>

      <h1 className="mt-5 font-serif text-[40px] font-semibold leading-[1.05] text-pretty text-forest-deep sm:text-[54px]">
        Algo salió mal
      </h1>

      <p className="mt-4 max-w-md text-[17px] leading-relaxed text-pretty text-ink-soft">
        Tuvimos un tropiezo inesperado. Puedes intentarlo de nuevo o regresar al inicio.
      </p>

      <div className="mt-8">
        <BotonPrimario as="button" type="button" onClick={() => reset()}>
          <FlechaInline className="h-[18px] w-[18px] -scale-x-100" />
          Intentar de nuevo
        </BotonPrimario>
      </div>

      <div className="mt-6">
        <EnlaceTexto href="/">Volver al inicio</EnlaceTexto>
      </div>
    </BloqueError>
  );
}
