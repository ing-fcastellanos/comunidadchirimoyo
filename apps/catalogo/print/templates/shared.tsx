/* =====================================================================
   shared.tsx — primitivas de las plantillas impresas A4.
   Portado del handoff de Claude Design (print/print-shared.jsx) a React
   server-render: insignias del sistema de fichas, sellos de conservación,
   QR (imagen real), placeholder de foto, wordmark y pie de página.
   Los iconos usan lucide-react (ya dependencia del catálogo).
   ===================================================================== */
import React from "react";
import {
  Bird, BadgeCheck, Shield, GitBranch, Ruler, MapPin, Clock, FileText,
  ScanEye, Sparkles, Binoculars, PencilLine, Feather, Image as ImageIcon,
  Search, BookOpen, Info, Camera, Library, Bookmark, Scale, HandHeart,
  Megaphone, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  bird: Bird, "badge-check": BadgeCheck, shield: Shield, "git-branch": GitBranch,
  ruler: Ruler, "map-pin": MapPin, clock: Clock, "file-text": FileText,
  "scan-eye": ScanEye, sparkles: Sparkles, binoculars: Binoculars,
  "pencil-line": PencilLine, feather: Feather, image: ImageIcon, search: Search,
  "book-open": BookOpen, info: Info, camera: Camera, library: Library,
  bookmark: Bookmark, scale: Scale, "hand-heart": HandHeart, megaphone: Megaphone,
};

export const Icon = ({ name, className = "" }: { name: string; className?: string }) => {
  const C = ICONS[name] ?? ImageIcon;
  return <C className={className} aria-hidden="true" />;
};

/* Paleta tonal de las insignias. Acentos cálidos SOLO aquí. */
export const TONE: Record<string, { bg: string; fg: string; dot: string; ring: string }> = {
  forest: { bg: "#e4f3ec", fg: "#0c5a36", dot: "#15824c", ring: "rgba(21,130,76,.28)" },
  teal: { bg: "#d8ece6", fg: "#236b59", dot: "#2f8d77", ring: "rgba(47,141,119,.30)" },
  ochre: { bg: "#f4ecd5", fg: "#7a5e16", dot: "#b08a2e", ring: "rgba(176,138,46,.32)" },
  terra: { bg: "#f6e2db", fg: "#8f3c25", dot: "#b5543a", ring: "rgba(181,84,58,.30)" },
  ink: { bg: "#e1eee5", fg: "#143226", dot: "#3a5547", ring: "rgba(20,50,38,.22)" },
};

/* Cromo: etiqueta + valor en una píldora con punto de estado */
export const Chip = ({ tone = "forest", label, value, className = "" }:
  { tone?: string; label?: string; value: string; className?: string }) => {
  const t = TONE[tone] || TONE.forest;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full pl-2.5 pr-3 py-[5px] text-[12.5px] leading-none ${className}`}
      style={{ background: t.bg, color: t.fg, boxShadow: `inset 0 0 0 1px ${t.ring}` }}
    >
      <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: t.dot }}></span>
      {label && <span className="font-700 uppercase tracking-[.10em] text-[10.5px] opacity-70">{label}</span>}
      <span className="font-600">{value}</span>
    </span>
  );
};

/* Sello cuadrado para los códigos de conservación (IUCN / NOM-059) */
export const CodeSeal = ({ tone = "forest", code, system }:
  { tone?: string; code: string; system: string }) => {
  const t = TONE[tone] || TONE.forest;
  return (
    <span className="inline-flex items-stretch overflow-hidden rounded-md text-[11px] leading-none"
      style={{ boxShadow: `inset 0 0 0 1px ${t.ring}` }}>
      <span className="grid place-items-center px-2 py-[5px] font-700 uppercase tracking-[.08em]"
        style={{ background: "#ffffff", color: "#3a5547" }}>{system}</span>
      <span className="grid place-items-center px-2 py-[5px] font-700"
        style={{ background: t.bg, color: t.fg }}>{code}</span>
    </span>
  );
};

/* QR real — se pasa el data-URI (PNG) ya generado con la librería `qrcode`.
   Mantiene el encuadre visual del componente original del diseño. */
export const QR = ({ src, size = 116, label, sub, light = false }:
  { src: string; size?: number; label?: string; sub?: string; light?: boolean }) => (
  <div className="inline-flex flex-col items-center gap-1.5">
    <div className="rounded-xl bg-white p-2.5" style={{ boxShadow: "inset 0 0 0 1px rgba(7,61,36,.16)" }}>
      <img src={src} width={size} height={size} alt="" style={{ display: "block" }} />
    </div>
    {label && (
      <div className="text-center leading-tight">
        <div className={`mono text-[10px] font-600 uppercase tracking-[.10em] ${light ? "text-mint-soft" : "text-forest-deep"}`}>{label}</div>
        {sub && <div className={`mono text-[9.5px] ${light ? "text-mint-soft/75" : "text-ink-soft/80"}`}>{sub}</div>}
      </div>
    )}
  </div>
);

/* Foto: si hay `src` (data-URI) se incrusta; si no, placeholder con leyenda. */
export const Photo = ({ src, caption, dark = false, className = "", children }:
  { src?: string | null; caption?: string; dark?: boolean; className?: string; children?: React.ReactNode }) => {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img src={src} alt={caption ?? ""} className="absolute inset-0 h-full w-full object-cover" />
        {children}
      </div>
    );
  }
  return (
    <div className={`relative grid place-items-center ${dark ? "photo-ph-dark" : "photo-ph"} ${className}`}>
      <div className="flex flex-col items-center gap-2 text-center px-4">
        <span className="grid h-11 w-11 place-items-center rounded-full"
          style={{ background: dark ? "rgba(255,255,255,.14)" : "rgba(7,61,36,.10)" }}>
          <Icon name="image" className={`h-5 w-5 ${dark ? "text-mint-soft" : "text-forest-deep/70"}`} />
        </span>
        {caption && (
          <span className={`mono text-[11px] uppercase tracking-[.14em] ${dark ? "text-mint-soft/90" : "text-forest-deep/70"}`}>
            {caption}
          </span>
        )}
      </div>
      {children}
    </div>
  );
};

/* Wordmark del proyecto — emblema (logo) + lockup tipográfico.
   `logo` es un data-URI; si falta, se omite el emblema. */
export const Wordmark = ({ light = false, compact = false, logo }:
  { light?: boolean; compact?: boolean; logo?: string | null }) => (
  <div className="flex items-center gap-3">
    {logo && (
      light ? (
        // logo blanco/inverso: directo sobre fondo oscuro, sin círculo
        <img src={logo} alt="" className="shrink-0 object-contain"
          style={{ height: compact ? 44 : 76, width: compact ? 44 : 76 }} />
      ) : (
        <span className="grid place-items-center rounded-full bg-white shrink-0"
          style={{ height: compact ? 38 : 46, width: compact ? 38 : 46, boxShadow: "0 1px 3px rgba(5,46,27,.18)" }}>
          <img src={logo} alt="" className="rounded-full object-cover"
            style={{ height: compact ? 32 : 39, width: compact ? 32 : 39 }} />
        </span>
      )
    )}
    <div className="leading-none">
      <div className={`font-serif italic font-600 ${compact ? "text-[17px]" : "text-[20px]"} ${light ? "text-white" : "text-forest-deep"}`}>
        Chirimoyo
      </div>
      <div className={`mt-1 text-[8.5px] font-700 uppercase tracking-[.24em] ${light ? "text-mint-soft/85" : "text-forest/85"}`}>
        Humedal · Orizaba
      </div>
    </div>
  </div>
);

/* Etiqueta de sección pequeña (kicker) */
export const Kicker = ({ children, light = false, className = "" }:
  { children: React.ReactNode; light?: boolean; className?: string }) => (
  <div className={`text-[11px] font-700 uppercase tracking-[.26em] ${light ? "text-mint-soft" : "text-forest"} ${className}`}>
    {children}
  </div>
);

