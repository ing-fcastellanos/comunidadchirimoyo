"use client";
/* Galeria.tsx — contenedor cliente que une la rejilla (GaleriaGrid) y el visor
   (Lightbox), portado del patrón del demo v0.dev (Galeria de Fotos.html). Mantiene
   el índice de la foto activa y la navegación circular. */
import { useState } from "react";
import { GaleriaGrid } from "./GaleriaGrid";
import { Lightbox } from "./Lightbox";
import type { FotoResuelta } from "@/lib/landing";

export function Galeria({ fotos }: { fotos: FotoResuelta[] }) {
  const [indice, setIndice] = useState<number | null>(null);

  const cerrar = () => setIndice(null);
  const anterior = () =>
    setIndice((n) => (n === null ? n : (n - 1 + fotos.length) % fotos.length));
  const siguiente = () =>
    setIndice((n) => (n === null ? n : (n + 1) % fotos.length));

  return (
    <>
      <GaleriaGrid fotos={fotos} onAbrir={setIndice} />
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
