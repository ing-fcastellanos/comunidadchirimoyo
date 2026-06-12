## Context

El buscador (#11/#12) enlaza a la ficha de detalle, que aún no existe. El handoff
(`docs/design/buscar-aves/project/`) trae los componentes de detalle (prototipo estático
React+Babel, datos hardcodeados por componente). Las 63 fichas (#10) ya tienen prosa
(`cuerpo` con secciones `##`), `fotos[]` con créditos, taxonomía, `conservacion` y estatus.
Faltan datos "ligeros" (autoridad, otros nombres, envergadura, mejor hora, medidas, hábitat,
temporada) que el experto autorará en el CSV. El catálogo es estático (ADR-0005/0014).

## Goals / Non-Goals

**Goals:**
- Ficha de detalle estática por especie en `/aves/[slug]`, fiel al handoff.
- Atribución CC visible en el carrusel (cierra el ciclo de créditos).
- OpenGraph por especie + especies relacionadas.
- Construible **hoy** sin los datos Tier B (renderizado tolerante).

**Non-Goals:**
- Vocalización/audio (#32), mapa geográfico real y zonas reales (#27), otras páginas de
  primer nivel, anfibios (Fase 2).

## Decisions

### D1 — Ruta `/aves/[slug]` con SSG por especie
`app/aves/[slug]/page.tsx` con `generateStaticParams()` (slugs de `getAllFichas()`) +
`generateMetadata()` por especie. Compatible con `output: export`. El primer nivel de ruta
queda libre para futuras páginas (buscador, colaboradores, contacto). `fichaToBird.href`
en `lib/search.ts` pasa de `/<slug>` a `/aves/<slug>`.

### D2 — Parser de secciones del cuerpo
Util `lib/ficha.ts: parseSecciones(cuerpo)` divide el Markdown por encabezados `##`
(insensible a acentos/mayúsculas) en `{ descripcion, dietaEcologia, reproduccion,
distribucion, comoIdentificarla, dondeObservarla, sabiasQue }`. Secciones ausentes →
`undefined`; los componentes que dependen de ellas se omiten. _Alternativa:_ render Markdown
plano — descartada porque el diseño separa cada sección en su propio bloque/card.

### D3 — Server page + carrusel cliente
La página es Server Component (lee fichas en build, mapea, compone metadata). La mayoría de
secciones son presentacionales (server). El **carrusel/lightbox** es interactivo →
Client Component (`components/ficha/FichaCarrusel.tsx`) con teclado + bloqueo de scroll.
Las fotos usan `fotoUrl(slug, archivo, 'web')` (variante grande del bucket).

### D4 — Carrusel con atribución CC
El pie y el lightbox muestran `credito`, `licencia` y enlazan `creditoUrl`/`licenciaUrl`
por foto. Es un **ajuste sobre el handoff** (que solo mostraba "nombre · lugar"): la
atribución enlazable de CC-BY/BY-SA es obligatoria y se difirió de las cards hasta aquí.

### D5 — Especies relacionadas
La página tiene todas las fichas (de `getAllFichas`): elige hasta N de la **misma familia**
(fallback **categoría**), excluyendo la actual. Sin datos nuevos.

### D6 — OpenGraph por especie
`generateMetadata` devuelve `title`, `description` (resumen de `## Descripción`),
`openGraph.images=[URL absoluta de la foto web]` y `twitter card`. Para previews al compartir.

### D7 — Campos Tier B: aditivos, tolerantes
Se añaden al esquema `autoridad` (string), `otrosNombres` (string[]), `envergadura` (string),
`mejorHora` (string). `medidas`/`habitat`/`temporada` ya existen (#9, opcionales) y solo se
pueblan. El `habitat` del esquema es **etiquetas** (kebab); QuickFacts las renderiza unidas
usando etiquetas legibles de `lib/dictionary.ts` (fallback al id) — no se crea campo nuevo.
La migración mapea las columnas; **no se corre hasta** que llegue el CSV extendido. Mientras,
QuickFacts/Hero/Observación omiten lo que falte.

### D8 — Distribución: placeholder ahora
Se porta el **mapa SVG estilizado genérico** del handoff (mismo para todas; el pie aclara que
es esquemático) + se muestran los textos de zona (`distribucion.zonaCria/zonaInvernada/
sitioLocal`) **cuando existan**. La geografía real por especie es de #27.

### D9 — Vocalización omitida
No se porta la sección (el handoff la sintetizaba con Web Audio; no es dato real). El audio
se recolecta y aplica en #32.

## Risks / Trade-offs

- **Parser de secciones frágil** si una ficha cambia los encabezados → mitigación: match
  insensible a acentos/caso; secciones faltantes se omiten sin romper.
- **Mapa genérico igual para todas** puede sugerir el mismo rango → mitigación: pie/caption
  lo marca como esquemático; lo real llega en #27.
- **Datos Tier B pendientes** → mitigación: render tolerante; se verifica primero SIN Tier B
  (datos actuales), y se regenera cuando llegue el CSV.
- **Lightbox** (bloqueo de scroll, teclado, foco) → portar con cuidado; `position: fixed`
  full-screen como en el handoff.
- **Export estático + ruta dinámica** → `generateStaticParams` enumera los 63 slugs; imágenes
  sin optimizador (`<img>`, ADR-0014/0016).

## Migration Plan

1. Esquema: 4 tipos nuevos en `fauna-schema.ts`; doc en `content/README.md` y `_ejemplo.md`.
2. `lib/ficha.ts` (parser de secciones + view-model de detalle).
3. Componentes `components/ficha/*` (secciones server + carrusel cliente), portados del handoff
   (sin Vocalización), carrusel con créditos.
4. Ruta `app/aves/[slug]/page.tsx` + `generateStaticParams`/`generateMetadata` + relacionadas;
   actualizar `fichaToBird.href`.
5. Migración: mapear columnas Tier B (código listo; correr cuando llegue el CSV extendido).
6. Verificar: `typecheck` + `build` (63 páginas de detalle) + OG presente + contraste visual.

## Open Questions

- ¿Cuántas especies relacionadas mostrar (4? 6?) y orden (familia→categoría)? — detalle de UI.
- Formato exacto de `medidas` en el CSV (`tamano_cm`/`peso_g` como rango `min-max`) — se fija
  con el experto al armar la hoja.
