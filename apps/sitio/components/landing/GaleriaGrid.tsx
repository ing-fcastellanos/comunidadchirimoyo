/* GaleriaGrid.tsx — rejilla MASONRY de fotos documentales. Portado del handoff
   v0.dev (components/GaleriaGrid.jsx). Presentacional: la apertura la inyecta el
   contenedor cliente vía `onAbrir(indice)`. aspect-ratio fijo por orientación
   reserva espacio y evita layout shift. Las fotos se sirven optimizadas con
   next/image (sitio corre en Cloud Run; el host del bucket está en remotePatterns). */
import Image from "next/image";
import type { FotoResuelta } from "@/lib/landing";

/* Dimensiones nominales por orientación: fijan la relación de aspecto de la celda
   (4:3 / 3:4). La imagen real se recorta con object-cover. Usamos width/height en
   vez de `fill` porque dentro de una rejilla CSS `columns` el `fill` (absolute)
   colapsa el tamaño del contenedor; con dimensiones en flujo, la celda se mide bien. */
const DIMS: Record<FotoResuelta["orientacion"], { w: number; h: number }> = {
  horizontal: { w: 1200, h: 900 },
  vertical: { w: 900, h: 1200 },
};

/* Anchura aproximada de la celda según las columnas (1 / 2 sm / 3 lg). */
const SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

export function GaleriaGrid({
  fotos,
  onAbrir,
}: {
  fotos: FotoResuelta[];
  onAbrir: (indice: number) => void;
}) {
  if (!fotos || fotos.length === 0) return null;

  return (
    <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]">
      {fotos.map((foto, i) => {
        const dims = DIMS[foto.orientacion] || DIMS.horizontal;
        return (
          <li key={foto.slug || i} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => onAbrir(i)}
              aria-label={`Ampliar foto: ${foto.alt}`}
              className="group relative block w-full overflow-hidden rounded-2xl ring-1 ring-forest/10 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
            >
              <Image
                src={foto.src}
                alt={foto.alt}
                width={dims.w}
                height={dims.h}
                sizes={SIZES}
                loading={i < 3 ? "eager" : "lazy"}
                priority={i === 0}
                className="block h-auto w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <span className="pointer-events-none absolute inset-0 bg-pine-deep/0 transition group-hover:bg-pine-deep/10" />
              {(foto.pie || foto.credito) && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-pine-deep/75 to-transparent p-3 pt-8 opacity-0 transition group-hover:opacity-100">
                  {foto.pie && (
                    <span className="font-mono text-[11px] leading-snug text-paper line-clamp-2">
                      {foto.pie}
                    </span>
                  )}
                  {foto.credito && (
                    <span className="font-mono text-[10px] uppercase tracking-wide text-mint/90">
                      © {foto.credito}
                    </span>
                  )}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
