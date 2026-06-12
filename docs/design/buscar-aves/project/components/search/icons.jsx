/* global React, window */
/* icons.jsx — iconos SVG propios (React-owned) para la búsqueda.
   Se evitan los <i data-lucide> dentro del árbol interactivo para no
   provocar conflictos de reconciliación al re-renderizar. */

/* contorno fino, estilo Lucide */
const Line = ({ className = "", sw = 2, children }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

const PATHS = {
  search:    <React.Fragment><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></React.Fragment>,
  x:         <React.Fragment><path d="M18 6 6 18" /><path d="m6 6 12 12" /></React.Fragment>,
  "chevron-down":  <path d="m6 9 6 6 6-6" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  "chevron-left":  <path d="m15 18-6-6 6-6" />,
  "arrow-right":   <React.Fragment><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></React.Fragment>,
  check:     <path d="M20 6 9 17l-5-5" />,
  filter:    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
  grid:      <React.Fragment><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></React.Fragment>,
  list:      <React.Fragment><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3.5 6h.01" /><path d="M3.5 12h.01" /><path d="M3.5 18h.01" /></React.Fragment>,
  waves:     <React.Fragment><path d="M2 7c.7.6 1.4 1 2.5 1C7 8 7 6 9.5 6s2.5 2 5 2 2.5-2 5-2" /><path d="M2 13c.7.6 1.4 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2" /><path d="M2 19c.7.6 1.4 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2" /></React.Fragment>,
  pin:       <React.Fragment><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></React.Fragment>,
  cloud:     <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.7 1.8A4 4 0 0 0 6 19h11.5Z" />,
  trees:     <React.Fragment><path d="M12 2 7 9h10z" /><path d="M12 7 6 15h12z" /><path d="M12 15v6" /></React.Fragment>,
  sprout:    <React.Fragment><path d="M12 21v-9" /><path d="M12 12c0-3 2-5 5-5 0 3-2 5-5 5Z" /><path d="M12 14c0-2.2-2-4-5-4 0 2.2 2 4 5 4Z" /></React.Fragment>,
  post:      <React.Fragment><path d="M12 21V4" /><path d="M12 9l5-3" /><path d="M12 13l-4-2" /></React.Fragment>,
  flame:     <path d="M12 2c1.2 3.5 5 5 5 9a5 5 0 0 1-10 0c0-1.8.9-3 2-4 .4 1.8 1.8 2 2.6 2C12 9.5 12 6 12 2Z" />,
  eye:       <React.Fragment><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></React.Fragment>,
  plane:     <path d="M10.2 9 3.5 7.3a.5.5 0 0 0-.5.8l3.5 3.6-2.2 2.2-1.9-.4a.5.5 0 0 0-.5.8l2 2 2 2a.5.5 0 0 0 .8-.5l-.4-1.9 2.2-2.2 3.6 3.5a.5.5 0 0 0 .8-.5L16.8 14l3.9-3.9a2 2 0 0 0-2.8-2.8L14 11.2Z" />,
  house:     <React.Fragment><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.3V21h14V9.3" /></React.Fragment>,
  shield:    <React.Fragment><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></React.Fragment>,
  droplet:   <path d="M12 22a7 7 0 0 0 7-7c0-3-3-7.2-7-11-4 3.8-7 8-7 11a7 7 0 0 0 7 7Z" />,
  raptor:    <React.Fragment><path d="M3 11c3.2 0 5-3.5 9-3.5S18 11 21 11" /><path d="M3 11c3.2 0 5 3 9 3s5.8-3 9-3" /><path d="M12 14v3" /></React.Fragment>,
  star:      <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.9 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z" />,
  ruler:     <React.Fragment><path d="M3 16 16 3l5 5L8 21z" /><path d="m7.5 12.5 2 2" /><path d="m11 9 2 2" /><path d="m14.5 5.5 2 2" /></React.Fragment>,
  binoculars:<React.Fragment><path d="M7 21a3 3 0 0 1-3-3V9a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3Z" /><path d="M17 21a3 3 0 0 0 3-3V9a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v9a3 3 0 0 0 3 3Z" /><path d="M10 9h4" /><path d="M9 6h6" /></React.Fragment>,
  alert:     <React.Fragment><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><path d="M12 17h.01" /></React.Fragment>,
  palette:   <React.Fragment><circle cx="12" cy="12" r="9" /><circle cx="8.5" cy="9.5" r="1" /><circle cx="15.5" cy="9.5" r="1" /><circle cx="9" cy="15" r="1" /></React.Fragment>,
  sparkles:  <path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.3L12 3Z" />,
  feather:   <React.Fragment><path d="M20 4a7 7 0 0 0-10 0L4 10v6a7 7 0 0 0 10 0l6-6Z" /><path d="M16 8 4 20" /></React.Fragment>,
};

const Ico = ({ name, className = "h-5 w-5", sw = 2 }) => (
  <Line className={className} sw={sw}>{PATHS[name] || null}</Line>
);

/* ---- siluetas de forma (line-art fino, consistente con la guía) ---- */
const Sil = ({ className = "", children }) => (
  <svg viewBox="0 0 48 36" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

const SHAPE_PATHS = {
  /* pato — cuerpo flotante, cabeza y pico a la derecha, línea de agua */
  pato: <React.Fragment>
    <path d="M6 17c2-5 16-6 21-3 1-4 7-5 9-1l4-1-4 4c2 5-10 8-19 7-7-1-11-2-11-3Z" />
    <path d="M4 27c3 1.5 7 1.5 10 0M20 27c3 1.5 7 1.5 10 0" />
  </React.Fragment>,
  /* garza — patas largas, cuello en S, pico daga (izquierda) */
  garza: <React.Fragment>
    <path d="M5 7l7 1" />
    <path d="M12 8c4 1 2 6 7 8 4 1.6 9 1 11 6" />
    <path d="M19 16c1.5 4 7 4 11 5" />
    <path d="M23 22v11M29 21v12" />
  </React.Fragment>,
  /* gallineta — cuerpo regordete, cabeza alzada, cola levantada, patas */
  gallineta: <React.Fragment>
    <path d="M9 19c-1-6 7-8 13-6 5 1 7 4 5 7-3 3-15 4-18-1Z" />
    <path d="M12 14c-2-5 2-8 5-6l-5 1" />
    <path d="M26 18l6-3" />
    <path d="M15 23v9M21 23v9" />
  </React.Fragment>,
  /* buceador — cuerpo bajo en el agua, cuello erguido y cabeza */
  buceador: <React.Fragment>
    <path d="M4 22c4-4 22-5 28-1" />
    <path d="M4 22c2 3 24 3 28-1" />
    <path d="M30 21c-1-5 0-9 3-11l5-1-4 3c1 3 0 7-2 9" />
    <path d="M3 28c3 1.5 8 1.5 11 0M20 28c3 1.5 8 1.5 11 0" />
  </React.Fragment>,
  /* playera — cuerpo redondo, pico recto largo, patas medianas */
  playera: <React.Fragment>
    <path d="M10 16c2-5 12-6 17-3 0-1 0-2 1-2-1 2 0 3 0 4 2 4-6 8-12 7-5-1-7-4-6-6Z" />
    <path d="M27 11l8-2" />
    <path d="M16 22v9M22 22v9" />
  </React.Fragment>,
  /* rapaz — silueta en planeo (dos arcos de ala) con cabeza */
  rapaz: <React.Fragment>
    <path d="M3 17Q14 7 24 15 34 7 45 17" />
    <path d="M22 15q2-2 4 0" />
  </React.Fragment>,
  /* pájaro pequeño — posado, cuerpo redondo, cola y pico cortos */
  pajaro: <React.Fragment>
    <path d="M13 14c1-5 7-7 12-5 3 1.2 4 4 3 6l5 4-6-1c-2 4-9 4-13 1-3-2-4-3-1-6Z" />
    <path d="M30 13l5-1" />
    <path d="M16 21l-2 8M22 22l1 8" />
    <path d="M18 30h7" />
  </React.Fragment>,
};

const ShapeIcon = ({ name, className = "h-7 w-10" }) => (
  <Sil className={className}>{SHAPE_PATHS[name] || null}</Sil>
);

Object.assign(window, { Ico, ShapeIcon });
