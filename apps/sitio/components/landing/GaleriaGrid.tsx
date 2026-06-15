/* GaleriaGrid.tsx — rejilla MASONRY de fotos documentales. Portado del handoff
   v0.dev (components/GaleriaGrid.jsx). Presentacional: la apertura la inyecta el
   contenedor cliente vía `onAbrir(indice)`. aspect-ratio fijo por orientación
   reserva espacio y evita layout shift. */
import type { FotoResuelta } from "@/lib/landing";

const ASPECTO: Record<FotoResuelta["orientacion"], string> = {
  horizontal: "aspect-[4/3]",
  vertical: "aspect-[3/4]",
};

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
        const aspecto = ASPECTO[foto.orientacion] || ASPECTO.horizontal;
        return (
          <li key={foto.slug || i} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => onAbrir(i)}
              aria-label={`Ampliar foto: ${foto.alt}`}
              className="group relative block w-full overflow-hidden rounded-2xl ring-1 ring-forest/10 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- foto desde public/ (interino) o bucket (ADR-0021) */}
              <img
                src={foto.src}
                alt={foto.alt}
                loading={i < 3 ? "eager" : "lazy"}
                className={`w-full ${aspecto} object-cover transition duration-300 group-hover:scale-[1.03]`}
              />
              <span className="pointer-events-none absolute inset-0 bg-pine-deep/0 transition group-hover:bg-pine-deep/10" />
              {foto.pie && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-pine-deep/70 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                  <span className="font-mono text-[11px] leading-snug text-paper line-clamp-2">
                    {foto.pie}
                  </span>
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
