"use client";
/* FichaCarrusel.tsx — carrusel de fotos del hero + lightbox a pantalla completa,
   con atribución por foto. Portado de docs/design/buscar-aves/.../HeroCarousel.jsx. */
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2, Camera } from "lucide-react";
import type { FotoVista } from "@/lib/ficha";

function Credito({ foto, className = "" }: { foto: FotoVista; className?: string }) {
  return (
    <span className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[12px] tracking-wide ${className}`}>
      <Camera className="h-4 w-4 shrink-0" aria-hidden />
      {foto.creditoUrl ? (
        <a href={foto.creditoUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
          {foto.credito}
        </a>
      ) : (
        <span>{foto.credito}</span>
      )}
      {foto.licencia && (
        <span className="opacity-75">
          ·{" "}
          {foto.licenciaUrl ? (
            <a href={foto.licenciaUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              {foto.licencia}
            </a>
          ) : (
            foto.licencia
          )}
        </span>
      )}
    </span>
  );
}

function Lightbox({ fotos, index, onClose, onNav }: { fotos: FotoVista[]; index: number; onClose: () => void; onNav: (d: number) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onNav(-1);
      else if (e.key === "ArrowRight") onNav(1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [onClose, onNav]);

  const foto = fotos[index];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pine-deep/95 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Vista ampliada de la imagen">
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Cerrar vista ampliada" className="absolute right-5 top-5 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-paper ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/20">
        <X className="h-6 w-6" />
      </button>
      {fotos.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onNav(-1); }} aria-label="Imagen anterior" className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-paper ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20 sm:left-8">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNav(1); }} aria-label="Imagen siguiente" className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-paper ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20 sm:right-8">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      <figure className="flex max-h-[92vh] max-w-[92vw] flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto.src} alt={foto.alt} className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl" />
        <figcaption className="flex flex-col items-center gap-1 text-paper/85">
          <Credito foto={foto} />
          <span className="font-mono text-[12px] text-paper/45">{index + 1} / {fotos.length}</span>
        </figcaption>
      </figure>
    </div>
  );
}

export function FichaCarrusel({ fotos }: { fotos: FotoVista[] }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const n = fotos.length;
  const go = (dir: number) => setIndex((i) => (i + dir + n) % n);
  const foto = fotos[index];

  return (
    <figure className="relative min-h-[340px] overflow-hidden bg-paper-deep lg:min-h-[600px]">
      {fotos.map((s, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-500 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <button onClick={() => setOpen(true)} className="group block h-full w-full cursor-zoom-in" aria-label={"Ampliar fotografía: " + s.alt}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={s.alt} loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" />
          </button>
        </div>
      ))}

      <span className="pointer-events-none absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-pine-deep/45 text-paper ring-1 ring-white/20 backdrop-blur">
        <Maximize2 className="h-5 w-5" />
      </span>

      {n > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Imagen anterior" className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper-card/85 text-forest-deep shadow-card ring-1 ring-forest/10 backdrop-blur transition-colors hover:bg-paper-card">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => go(1)} aria-label="Imagen siguiente" className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper-card/85 text-forest-deep shadow-card ring-1 ring-forest/10 backdrop-blur transition-colors hover:bg-paper-card">
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <figcaption className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pine-deep/80 to-transparent px-6 pb-12 pt-16">
        <Credito foto={foto} className="pointer-events-auto text-paper/90" />
      </figcaption>

      {n > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
          {fotos.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} aria-label={"Ir a la imagen " + (i + 1)} className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-paper" : "w-2 bg-paper/50 hover:bg-paper/80"}`} />
          ))}
        </div>
      )}

      {open && <Lightbox fotos={fotos} index={index} onClose={() => setOpen(false)} onNav={go} />}
    </figure>
  );
}
