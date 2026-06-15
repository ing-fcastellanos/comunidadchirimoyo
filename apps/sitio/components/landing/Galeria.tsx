"use client";
/* Galeria.tsx — contenedor cliente que une la rejilla (GaleriaGrid) y el visor
   (Lightbox), portado del patrón del demo v0.dev (Galeria de Fotos.html). Mantiene
   el índice de la foto activa y la navegación circular.

   Carga incremental: renderiza la galería en lotes de LOTE y monta más al acercarse
   al final (IntersectionObserver), para no inyectar cientos de nodos de golpe. El
   lightbox sigue operando sobre la lista completa (índices = posición real). */
import { useEffect, useRef, useState } from "react";
import { GaleriaGrid } from "./GaleriaGrid";
import { Lightbox } from "./Lightbox";
import type { FotoResuelta } from "@/lib/landing";

const LOTE = 30;

export function Galeria({ fotos }: { fotos: FotoResuelta[] }) {
  const [indice, setIndice] = useState<number | null>(null);
  const [visibles, setVisibles] = useState(LOTE);
  const sentinelaRef = useRef<HTMLDivElement>(null);
  const hayMas = visibles < fotos.length;

  /* Monta el siguiente lote al acercarse el sentinela al viewport. Reobservamos
     en cada lote para que, si el sentinela sigue visible, se cargue el siguiente. */
  useEffect(() => {
    const el = sentinelaRef.current;
    if (!el || !hayMas) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibles((n) => Math.min(n + LOTE, fotos.length));
        }
      },
      { rootMargin: "600px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hayMas, visibles, fotos.length]);

  const cerrar = () => setIndice(null);
  const anterior = () =>
    setIndice((n) => (n === null ? n : (n - 1 + fotos.length) % fotos.length));
  const siguiente = () =>
    setIndice((n) => (n === null ? n : (n + 1) % fotos.length));

  return (
    <>
      <GaleriaGrid fotos={fotos.slice(0, visibles)} onAbrir={setIndice} />

      {hayMas && <div ref={sentinelaRef} aria-hidden className="h-px w-full" />}

      {fotos.length > LOTE && (
        <p
          className="mt-8 text-center font-mono text-[12px] text-ink-soft/70"
          aria-live="polite"
        >
          Mostrando {Math.min(visibles, fotos.length)} de {fotos.length} fotos
        </p>
      )}

      <Lightbox
        fotos={fotos}
        indice={indice}
        onCerrar={cerrar}
        onAnterior={anterior}
        onSiguiente={siguiente}
      />
    </>
  );
}
