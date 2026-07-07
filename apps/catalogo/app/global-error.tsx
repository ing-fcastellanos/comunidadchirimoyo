"use client";
/* global-error.tsx — boundary del root layout (#26): captura errores que
   ocurren en el propio `layout.tsx` o antes de que monte, algo que
   `error.tsx` no puede cubrir. Next exige que reemplace TODO el árbol,
   incluido <html>/<body> — no hereda Header/Footer. Mismo copy/ilustración
   que `error.tsx`, mismo log con console.error. */
import { useEffect } from "react";
import { serif, sans } from "@/lib/fonts";
import {
  BadgeEstado,
  BloqueError,
  BotonPrimario,
  EnlaceTexto,
  FlechaInline,
  IlustracionHumedal,
} from "@/components/error/PantallasError";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es" className={`${serif.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
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
      </body>
    </html>
  );
}
