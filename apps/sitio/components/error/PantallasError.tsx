/* PantallasError.tsx — piezas compartidas por las pantallas de error (404 y
   error inesperado). Portado del handoff v0.dev (PantallasError.jsx), adaptado
   a los tokens del proyecto (sin colores hardcodeados) y a las utilidades
   estándar de Tailwind.

   Sin "use client": son presentacionales y se usan tanto desde el Server
   Component `app/not-found.tsx` como desde el Client Component `app/error.tsx`.
   Los bloques completos de cada pantalla viven en esas páginas; aquí solo el
   botón, el enlace, la flecha y la ilustración reutilizables. */
import type { ComponentProps, ReactNode } from "react";

const FOCO =
  "focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

/* Botón pill primario. Polimórfico: `<a>` (404) o `<button>` (reintentar). */
type BotonProps =
  | ({ as?: "a" } & ComponentProps<"a">)
  | ({ as: "button" } & ComponentProps<"button">);

export function BotonPrimario({ as = "a", className = "", children, ...props }: BotonProps) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full bg-forest px-7 py-3.5 text-[16px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(12,90,54,.7)] transition-colors hover:bg-forest-deep ${FOCO} ${className}`;
  if (as === "button") {
    return (
      <button {...(props as ComponentProps<"button">)} className={cls}>
        {children}
      </button>
    );
  }
  return (
    <a {...(props as ComponentProps<"a">)} className={cls}>
      {children}
    </a>
  );
}

/* Enlace de texto secundario. */
export function EnlaceTexto({ className = "", children, ...props }: ComponentProps<"a">) {
  return (
    <a
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[15px] font-semibold text-forest underline-offset-4 transition-colors hover:text-forest-deep hover:underline ${FOCO} ${className}`}
    >
      {children}
    </a>
  );
}

/* Flecha inline decorativa. */
export function FlechaInline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/* Badge de estado (p. ej. "Error 404"). `tono` elige la paleta. */
export function BadgeEstado({ tono, children }: { tono: "forest" | "terra"; children: ReactNode }) {
  const estilos =
    tono === "terra"
      ? "bg-terra-wash text-terra-deep ring-terra/20"
      : "bg-mint-wash text-forest-deep ring-forest/15";
  const punto = tono === "terra" ? "bg-terra" : "bg-forest";
  return (
    <span
      className={`mt-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.22em] ring-1 ring-inset ${estilos}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${punto}`} />
      {children}
    </span>
  );
}

/* =====================================================================
   Ilustración: escena de juncos del humedal con un ave.
   `acento` (CSS var de token) tiñe al ave: forest-soft (404) o terra (error).
   `variante`: "vuela" (ave en vuelo) | "enredada" (ave posada y quieta).
   Decorativa → aria-hidden.
   ===================================================================== */
export function IlustracionHumedal({
  acento = "var(--color-forest-soft)",
  variante = "vuela",
}: {
  acento?: string;
  variante?: "vuela" | "enredada";
}) {
  return (
    <svg
      viewBox="0 0 320 220"
      role="img"
      aria-hidden="true"
      className="h-auto w-full max-w-[300px]"
    >
      {/* halo suave de fondo */}
      <ellipse cx="160" cy="150" rx="130" ry="58" fill="var(--color-mint-wash)" />
      <ellipse cx="160" cy="165" rx="150" ry="30" fill="var(--color-mint-soft)" opacity="0.6" />

      {/* agua: línea de orilla */}
      <path d="M30 178 Q160 168 290 178" stroke="var(--color-mint)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M55 190 Q160 182 265 190" stroke="var(--color-mint)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />

      {/* juncos / espadañas (cattails) */}
      <g stroke="var(--color-forest-soft)" strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M96 180 Q92 130 98 92" />
        <path d="M120 182 Q124 138 120 104" />
        <path d="M210 182 Q206 134 212 100" />
        <path d="M236 180 Q240 140 234 110" />
      </g>
      {/* espigas de espadaña */}
      <g fill="var(--color-forest-deep)">
        <rect x="93" y="78" width="10" height="24" rx="5" />
        <rect x="115" y="90" width="10" height="22" rx="5" />
        <rect x="207" y="86" width="10" height="23" rx="5" />
        <rect x="229" y="96" width="10" height="21" rx="5" />
      </g>
      {/* hojas finas */}
      <g stroke="var(--color-mint-deep)" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M134 182 Q150 150 150 116" />
        <path d="M196 182 Q182 152 184 120" />
        <path d="M78 182 Q70 156 72 130" />
      </g>

      {/* sol/luna pálido */}
      <circle cx="250" cy="52" r="20" fill="var(--color-paper-card)" opacity="0.8" />
      <circle cx="250" cy="52" r="20" fill="var(--color-mint)" opacity="0.18" />

      {variante === "vuela" ? (
        /* ave en vuelo (alas en V + cuerpo) sobre los juncos */
        <g transform="translate(150 56) rotate(-12)">
          <ellipse cx="0" cy="0" rx="15" ry="7" fill={acento} />
          <circle cx="13" cy="-3" r="5.5" fill={acento} />
          <path d="M17 -4 l9 -2 -7 4 z" fill="var(--color-ochre)" />
          <circle cx="15" cy="-4" r="1.3" fill="var(--color-paper-card)" />
          {/* alas */}
          <path d="M-2 -2 Q-20 -22 -36 -16 Q-22 -8 -6 -3 Z" fill={acento} opacity="0.92" />
          <path d="M-2 1 Q-18 16 -34 14 Q-20 6 -6 2 Z" fill={acento} opacity="0.78" />
          {/* cola */}
          <path d="M-12 1 l-14 5 13 -1 z" fill={acento} opacity="0.85" />
          {/* líneas de vuelo */}
          <g stroke={acento} strokeWidth="2" strokeLinecap="round" opacity="0.4">
            <path d="M30 -14 q14 -2 24 2" fill="none" />
            <path d="M34 -6 q12 0 20 4" fill="none" />
          </g>
        </g>
      ) : (
        /* ave posada y quieta entre los juncos (con una pluma cayendo) */
        <g transform="translate(160 116)">
          {/* cuerpo */}
          <ellipse cx="0" cy="0" rx="16" ry="12" fill={acento} />
          {/* ala plegada */}
          <path d="M-12 -2 Q4 -8 12 2 Q0 6 -10 5 Z" fill={acento} opacity="0.7" />
          {/* cabeza inclinada (abatida) */}
          <circle cx="14" cy="6" r="7" fill={acento} />
          <path d="M20 7 l9 3 -8 1 z" fill="var(--color-ochre)" />
          <circle cx="16" cy="4" r="1.4" fill="var(--color-paper-card)" />
          {/* patas hacia un junco */}
          <g stroke="var(--color-forest-deep)" strokeWidth="2" strokeLinecap="round">
            <path d="M-4 12 l-2 12" />
            <path d="M4 12 l1 12" />
          </g>
          {/* pluma cayendo (señal de tropiezo) */}
          <g transform="translate(-30 18) rotate(20)" opacity="0.8">
            <path d="M0 0 q6 -10 2 -22 q-7 12 -2 22 z" fill={acento} opacity="0.55" />
            <path d="M1 -2 l0 -18" stroke={acento} strokeWidth="1.2" />
          </g>
        </g>
      )}
    </svg>
  );
}

/* Contenedor común: bloque centrado que vive DENTRO del <main> del layout
   (por eso es <section>, no <main>: evita anidar landmarks). */
export function BloqueError({ children, "aria-label": ariaLabel }: { children: ReactNode; "aria-label"?: string }) {
  return (
    <section
      aria-label={ariaLabel}
      className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center sm:py-20"
    >
      {children}
    </section>
  );
}
