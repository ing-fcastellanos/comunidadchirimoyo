"use client";
/* Lightbox.tsx — visor ampliado accesible (Client Component). Portado del handoff
   v0.dev (components/Lightbox.jsx). Overlay pine-deep/90 · cierre por X / Escape /
   click en fondo · navegación con ← → y botones · focus trap · scroll lock ·
   role="dialog" aria-modal. Sin librerías externas. */
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import type { FotoResuelta } from "@/lib/landing";

export function Lightbox({
  fotos,
  indice,
  onCerrar,
  onAnterior,
  onSiguiente,
}: {
  fotos: FotoResuelta[];
  indice: number | null;
  onCerrar: () => void;
  onAnterior: () => void;
  onSiguiente: () => void;
}) {
  const abierto = indice !== null && Boolean(fotos[indice]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const focoPrevioRef = useRef<Element | null>(null);

  /* teclado: Escape / flechas + focus trap (Tab) */
  useEffect(() => {
    if (!abierto) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCerrar();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onAnterior();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onSiguiente();
      } else if (e.key === "Tab") {
        const cont = dialogRef.current;
        if (!cont) return;
        const focusables = cont.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const primero = focusables[0];
        const ultimo = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [abierto, onCerrar, onAnterior, onSiguiente]);

  /* scroll lock + manejo de foco (guardar / mover / devolver) */
  useEffect(() => {
    if (!abierto) return;
    focoPrevioRef.current = document.activeElement;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => cerrarRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = overflowPrevio;
      const previo = focoPrevioRef.current;
      if (previo instanceof HTMLElement) previo.focus();
    };
  }, [abierto]);

  if (indice === null || !fotos[indice]) return null;

  const foto = fotos[indice];
  const hayVarias = fotos.length > 1;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={foto.alt || "Foto ampliada"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-pine-deep/90 p-4 backdrop-blur-sm sm:p-8"
    >
      <button
        ref={cerrarRef}
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-paper/10 text-paper ring-1 ring-inset ring-paper/20 transition hover:bg-paper/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mint/40"
      >
        <Icon name="X" className="h-6 w-6" />
      </button>

      {hayVarias && (
        <button
          type="button"
          onClick={onAnterior}
          aria-label="Foto anterior"
          className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper/10 text-paper ring-1 ring-inset ring-paper/20 transition hover:bg-paper/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mint/40 sm:left-5"
        >
          <Icon name="ChevronLeft" className="h-6 w-6" />
        </button>
      )}

      {hayVarias && (
        <button
          type="button"
          onClick={onSiguiente}
          aria-label="Foto siguiente"
          className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper/10 text-paper ring-1 ring-inset ring-paper/20 transition hover:bg-paper/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mint/40 sm:right-5"
        >
          <Icon name="ChevronRight" className="h-6 w-6" />
        </button>
      )}

      <figure className="flex max-h-full max-w-3xl flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- excluido deliberadamente de la
           migración a next/image (#26): el tamaño es intrínsecamente dinámico
           (max-h-[72vh] w-auto, sin contenedor de aspect-ratio fijo — la imagen se ajusta a su
           propia relación de aspecto dentro de un máximo). next/image exige `width`/`height`
           conocidos o un contenedor `fill` de tamaño fijo; forzarlo aquí requeriría un rework de
           layout no pedido por ese change. Foto desde public/ (interino) o bucket (ADR-0021). */}
        <img
          src={foto.src}
          alt={foto.alt}
          className="max-h-[72vh] w-auto max-w-full rounded-2xl object-contain shadow-[0_24px_60px_-20px_rgba(0,0,0,.6)] ring-1 ring-paper/15"
        />
        {(foto.pie || foto.credito || foto.fecha || hayVarias) && (
          <figcaption className="max-w-xl text-center">
            {foto.pie && (
              <span className="font-mono text-[12px] leading-relaxed text-paper/85 text-pretty">
                {foto.pie}
              </span>
            )}
            {(foto.credito || foto.fecha) && (
              <span className="mt-1 block font-mono text-[11px] text-paper/60">
                {[foto.credito && `© ${foto.credito}`, foto.fecha]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
            {hayVarias && (
              <span className="mt-1 block font-mono text-[11px] text-mint">
                {indice + 1} / {fotos.length}
              </span>
            )}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
