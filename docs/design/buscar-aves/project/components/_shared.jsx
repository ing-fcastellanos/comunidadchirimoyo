/* global React */
/* =====================================================================
   _shared.jsx — primitivas compartidas por todos los componentes
   (iconos, glifos SVG, Badge, SectionTitle, Section, constantes)
   Exporta todo a window para que los demás archivos lo consuman.
   ===================================================================== */
const { useEffect, useRef, useState } = React;

const LOGO = "assets/logo-chirimoyo.jpeg";
const PHOTO = "assets/avetoro.png";

/* Re-renderiza los placeholders <i data-lucide> a SVG tras montar */
function useLucide(dep) {
  useEffect(() => {
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }, [dep]);
}

/* Icono de la librería lucide (decorativo, no interactivo) */
const Icon = ({ name, className = "" }) => (
  <i data-lucide={name} className={className}></i>
);

/* ---------- glifos SVG propios de React (para zonas interactivas) ---------- */
const Stroke = ({ className = "", children }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const ChevLeft  = (p) => <Stroke {...p}><polyline points="15 18 9 12 15 6" /></Stroke>;
const ChevRight = (p) => <Stroke {...p}><polyline points="9 18 15 12 9 6" /></Stroke>;
const XGlyph    = (p) => <Stroke {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Stroke>;
const Expand    = (p) => <Stroke {...p}><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="m21 3-7 7" /><path d="m3 21 7-7" /></Stroke>;
const Camera    = (p) => <Stroke {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></Stroke>;
const ImageGlyph = (p) => <Stroke {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></Stroke>;
const AudioLines = (p) => <Stroke {...p}><path d="M2 10v3" /><path d="M6 6v11" /><path d="M10 3v18" /><path d="M14 8v7" /><path d="M18 5v13" /><path d="M22 10v3" /></Stroke>;
const InfoGlyph = (p) => <Stroke {...p}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></Stroke>;
const PlayGlyph = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M7 5v14l11-7z" /></svg>
);
const Spinner = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* ---------- bloques de UI compartidos ---------- */

const Badge = ({ children, tone }) => {
  const tones = {
    forest: "bg-mint-soft text-forest-deep ring-forest/20",
    ochre:  "bg-[#f3ead2] text-[#7a5e16] ring-[#e2d3a3]",
    terra:  "bg-[#f6e1da] text-[#8f3c25] ring-[#e8c3b6]",
    teal:   "bg-[#d6ece6] text-[#236b59] ring-[#aad3c8]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-600 ring-1 ring-inset ${tones[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70"></span>
      {children}
    </span>
  );
};

const SectionTitle = ({ icon, kicker, children }) => (
  <header className="mb-7 flex items-end gap-4">
    {icon && (
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
        <Icon name={icon} className="h-6 w-6" />
      </span>
    )}
    <div>
      {kicker && (
        <div className="mb-0.5 text-[12px] font-700 uppercase tracking-[0.22em] text-forest">{kicker}</div>
      )}
      <h2 className="font-serif text-[34px] leading-none font-600 text-forest-deep">{children}</h2>
    </div>
  </header>
);

const Section = ({ children, className = "", id }) => (
  <section id={id} className={`mx-auto max-w-6xl px-6 ${className}`}>{children}</section>
);

/* ---------- exportar a window para los demás scripts babel ---------- */
Object.assign(window, {
  LOGO, PHOTO, useLucide, Icon,
  Stroke, ChevLeft, ChevRight, XGlyph, Expand, Camera, ImageGlyph, AudioLines, InfoGlyph, PlayGlyph, Spinner,
  Badge, SectionTitle, Section,
});
