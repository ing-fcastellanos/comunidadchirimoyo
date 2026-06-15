# Prompts v0.dev — elementos nuevos del landing chirimoyo.org

Handoff del flujo v0.dev (CLAUDE.md). Solo los 3 patrones que **no existen** en el
sistema: línea de tiempo (logros), linktree y galería. El resto del landing reusa
patrones ya portados del catálogo.

> **Sistema de diseño (incluir en CADA prompt).** Pega este bloque al inicio de
> cada generación para que v0.dev respete los tokens del proyecto:

```
Design system (Comunidad Chirimoyo — defensa de un humedal; tono comunitario, ecologista, honesto):
- Tailwind v4. Domina el verde (~90% de la superficie); acentos cálidos solo en señales.
- Colores: forest #15824c, forest-deep #0c5a36, forest-soft #2f9d6a, pine #073d24,
  pine-deep #052e1b, mint #8ed8c0, mint-soft #cdeedd, mint-deep #46b08c, mint-wash #e4f3ec,
  paper #eef5ef, paper-card #ffffff, paper-deep #e1eee5, ink #143226, ink-soft #3a5547,
  ochre #b08a2e, terra #b5543a, teal #2f8d77.
- Tipografía: títulos en serif (Cormorant Garamond, font-serif, semibold); cuerpo en
  sans (Source Sans 3); mono del sistema para pies de foto.
- Tarjetas: rounded-2xl, bg-paper-card (#fff), shadow suave verdosa
  (0 8px 24px -12px rgba(7,61,36,.22)), ring-1 ring-forest/[0.07].
- Íconos: lucide-react, trazo ~2px, en un cuadrito h-12 w-12 rounded-xl bg-mint-wash
  text-forest-deep ring-1 ring-forest/10.
- Kicker de sección: text-[12px] font-bold uppercase tracking-[0.22em] text-forest.
- Banda destacada: fondo pine-deep con texto paper y botón mint.
- Foco accesible visible (focus-visible:ring-4 ring-forest/25). Español. Mobile-first (~380px).
- Server Components por defecto (Next 15 App Router); solo usar "use client" si hay estado/eventos.
```

---

## 1) Línea de tiempo de logros (`logros.json`)

```
Genera un componente React (Next.js 15, Tailwind v4) "LineaTiempo" que muestre los logros
de una comunidad en una LÍNEA DE TIEMPO VERTICAL, en orden cronológico ascendente.

Datos (prop `hitos`, ya ordenados): array de
  { fecha: "YYYY-MM" | "YYYY-MM-DD", titulo: string, descripcion: string,
    tipo: "hito"|"jornada"|"festival"|"reforestacion"|"divulgacion"|"ciencia"|"reconocimiento",
    foto: string | null }

Requisitos:
- Riel vertical con un nodo por hito; la fecha legible (ej. "Ene 2023") junto al nodo.
- Cada hito: título en serif, descripción en sans, y un ícono lucide según `tipo`
  (hito→Flag, jornada→Trash2, festival→PartyPopper, reforestacion→TreePine,
   divulgacion→Megaphone, ciencia→Microscope, reconocimiento→Award) en el cuadrito mint-wash.
- Si `foto` no es null, muéstrala pequeña, redondeada (rounded-xl), object-cover; si es null,
  no muestres imagen ni hueco roto.
- Debe TOLERAR texto placeholder y foto null sin romperse.
- En móvil: una sola columna con el riel a la izquierda. En desktop puede alternar lados
  (zig-zag) o mantener una sola columna; prioriza legibilidad sobre adorno.
- Encabezado de sección con kicker "LO QUE HEMOS LOGRADO" + título e ícono (History).
- Respeta el design system de arriba. Sin librerías de animación.
```

---

## 2) Linktree (`enlaces.json`)

```
Genera un componente React (Next.js 15, Tailwind v4) "Linktree" tipo "árbol de enlaces"
para el pie/entrada del ecosistema de un proyecto comunitario, claramente DISTINTO de la
barra de navegación del header.

Datos (props):
- sitios: [{ slug, titulo, descripcion, url, icono (nombre lucide) }]  // subdominios del proyecto
- redes: [{ red, titulo, url, icono }]                                  // facebook, instagram
- contacto: { email, telefono, telefonoDisplay }
- ubicacion: { nombre, ciudad, mapsUrl }

Requisitos:
- Los `sitios` como tarjetas/filas grandes y tocables (rounded-2xl, bg-paper-card, ring forest,
  shadow suave) con ícono en cuadrito mint-wash, título en serif, descripción corta y una
  flecha (ArrowUpRight). Toda la fila es el enlace; foco visible.
- `redes` como botones-chip compactos con su ícono.
- contacto: email (mailto:) y teléfono (tel:, mostrar telefonoDisplay) como acciones claras.
- ubicacion: enlace "Cómo llegar" (MapPin) que abre mapsUrl en pestaña nueva.
- Enlaces externos con target="_blank" rel="noopener noreferrer".
- Layout mobile-first; en desktop, los sitios pueden ir en grid de 2-3 columnas.
- Encabezado de sección con kicker "EL ECOSISTEMA" + título e ícono (Link2/Compass).
- Respeta el design system. Español.
```

---

## 3) Galería con lightbox (`galeria.json`)

```
Genera DOS componentes React (Next.js 15, Tailwind v4): "GaleriaGrid" (Server Component) y
"Lightbox" (Client Component, "use client") para una galería de fotos documentales de una
comunidad ambiental.

Datos (prop `fotos`, en orden): array de
  { slug, src (URL absoluta ya resuelta), alt, pie, orientacion: "horizontal"|"vertical" }

Requisitos GaleriaGrid:
- Rejilla tipo MASONRY que acomode fotos horizontales y verticales SIN recortes feos y
  SIN layout shift (usa la orientación para el aspect-ratio; columnas que fluyan).
- Cada foto: rounded-2xl, ring-1 ring-forest/10, object-cover; loading="lazy" salvo las
  primeras visibles; alt obligatorio. Al pasar el cursor, leve realce.
- Al activar una foto (click o Enter), abre el Lightbox en esa foto.

Requisitos Lightbox (client):
- Overlay oscuro (pine-deep/90) con la foto ampliada centrada y su `pie` debajo.
- Cerrar con botón (X), tecla Escape y click en el fondo. Navegar anterior/siguiente con
  flechas del teclado y botones (ChevronLeft/ChevronRight).
- Manejo de foco accesible: atrapar el foco dentro del lightbox, devolverlo al cerrar,
  role="dialog" aria-modal. Bloquear el scroll del fondo mientras está abierto.
- Respeta el design system (verde, serif para textos destacados, mono para el pie). Español.
- Sin librerías externas de lightbox; solo React + Tailwind.
```

---

## Notas de porteo (tras generar en v0.dev)

- Sustituir colores hex por las clases de token (`bg-forest`, `text-forest-deep`, etc.);
  **nada de hex fuera de `tokens.css`**.
- Usar el wrapper `Icon` (`components/ui/Icon.tsx`) en vez de importar lucide directo.
- Resolver las URLs de imagen con `mediaUrl()` del data-layer (no hardcodear rutas).
- Envolver en `Section`/`SectionTitle` cuando aplique para alinear con el resto del landing.
- Insertar Logros y Linktree en los huecos ya marcados en `app/page.tsx`.
```
