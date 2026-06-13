# ADR-0018 — Mapa de distribución: geografía real (Natural Earth) + zonas curadas por país

- **Estado:** Accepted
- **Fecha:** 2026-06-13
- **Decisores:** @ing-fcastellanos
- **Issue:** #27 (spike: mapa de distribución por especie)

## Contexto

La ficha de detalle mostraba un **mapa esquemático placeholder** (silueta de Norteamérica
dibujada a mano + un punto), y el handoff de diseño prototipó las zonas como **bandas
latitudinales** (mitad norte = cría, mitad sur = invernada) clipadas a la silueta. Eso no
escala a cientos de especies ni distingue, p. ej., una especie del Pacífico de una del Golfo,
y rompe con las residentes (una sola zona).

El spike #27 evaluó cómo representar el rango por especie de forma **estática, escalable y libre
de licencias restrictivas**. Se descartaron desde el explore IUCN/eBird (licencia restringida)
y GBIF como base (puntos ruidosos, otro significado). Las opciones de formato consideradas:
bandas latitudinales, países/regiones, bounding boxes y polígonos a mano por especie.

## Decisión

**Geografía real + zonas curadas a granularidad de país**, render estático:

- **Mapa base:** se genera **una sola vez** (script `scripts/gen-mapa-base.py`) desde
  **Natural Earth admin-0 1:110m** (dominio público), recortado al encuadre **Norte +
  Centroamérica + Caribe (+ norte de Sudamérica)**, proyección **equirectangular** (con
  corrección de longitud por `cos(lat media)`), simplificado. Se emite un **asset commiteado**
  `apps/catalogo/lib/mapa-americas.ts` = `{ viewBox, marker, outline, regions }`, donde las
  claves de `regions` son códigos **ISO 3166-1 alpha-2**. El crudo de Natural Earth **no** se
  versiona; solo el asset derivado. El build de Next **no** incorpora librerías geográficas.
- **Zona por especie:** campo opcional `distribucion?: { cria?, invernada?, residente?, notas? }`
  en la ficha, cada zona una lista de códigos ISO. Se pintan sobre la geografía en tonos
  **forest (cría) / mint (invernada) / teal (residente)**.
- **Render:** Server Component (SVG puro, sin JS de cliente, fiel a ADR-0014). Geografía real
  + **marcador fijo de la Laguna del Chirimoyo siempre**; zonas si hay curaduría; leyenda
  derivada de `estatusMigratorio`. **Sin curaduría no se inventa rango**: geografía + marcador
  + etiqueta de estatus, anclado en México.
- **Curaduría mínima:** `distribucion` es opcional; cubre las 63 desde el día uno con el render
  por defecto y se enriquece especie por especie.

## Evaluación de la capa opcional GBIF (veredicto: descartada por ahora)

Se evaluó una capa de puntos de ocurrencia GBIF contra un criterio de corte explícito
(licencia redistribuible · peso/fricción · señal sin ruido). Evidencia (API GBIF, jun-2026):

- **Volumen:** una sola especie común (*Botaurus lentiginosus*) tiene **~477,570 ocurrencias**.
  Servirlas estáticamente exige capping/clustering y consultas por especie en build.
- **Licencias:** mayormente `CC BY 4.0` (~96%), con `CC BY-NC 4.0` y `CC0`. Redistribuibles,
  pero la atribución de CC-BY es a **nivel de dataset** (cientos de DOIs por especie) → fricción
  alta.
- **Semántica/ruido:** los puntos de observación no son rango; superpuestos a las zonas curadas
  ensucian el mensaje (justo lo que el explore anticipó).

**Veredicto:** **descartada como capa del mapa**. Falla peso/fricción y señal/ruido para el
propósito (contexto de rango). Se podría reconsiderar a futuro como una capa **distinta y
opt-in de observaciones locales** (pocos puntos cerca de la laguna), bajo un nuevo ADR.

## Alternativas consideradas

- **Bandas latitudinales (handoff):** autoría trivial y on-brand, pero baja fidelidad
  (Pacífico = Golfo) y rota para residentes. Descartada como modelo de datos.
- **Bounding boxes:** punto medio sin gracia (rectángulos sobre mar). Descartada.
- **Polígonos a mano por especie:** alta fidelidad pero no escala (requiere GIS por ficha).
  Descartada.
- **Granularidad sub-país (admin-1 / estados):** más fiel (p. ej. solo costas del Golfo) pero
  multiplica autoría y peso del asset. **Diferida** como extensión aditiva futura.

## Consecuencias

### Positivas

- Escalable: la zona es solo datos (listas ISO); el mapa base es un asset único.
- Libre de licencias: Natural Earth es dominio público; sin fricción de redistribución.
- Estático y ligero: SVG por página diminuto, sin geo libs en el build, sin JS de cliente.
- Honesto por defecto: sin curaduría no inventa rango; el marcador local siempre presente.

### Negativas

- **Granularidad de país sobredimensiona** (p. ej. "todo MX" aunque sea costero). Se acota con
  `notas` y la prosa de `## Distribución`. Admin-1 queda como extensión futura.
- La proyección equirectangular distorsiona latitudes altas (aceptable; el norte apenas aparece).
- El asset depende de una versión de Natural Earth (documentada y regenerable con el script).

### Neutras

- El esquema de la ficha (#9) se extiende de forma **aditiva** con `distribucion` (opcional).

## Plan de revisión

Reconsiderar **admin-1** si se necesita precisión sub-país, o una **capa opt-in de observaciones
locales** (GBIF acotado a la laguna) si surge la demanda — ambas como cambios aditivos / nuevo ADR.

## Referencias

- ADR-0005 (catálogo estático), ADR-0014 (export estático), ADR-0011 (i18n), ADR-0016 (assets
  fuera del repo).
- Change OpenSpec `mapa-distribucion-especie`. `scripts/gen-mapa-base.py`,
  `apps/catalogo/lib/mapa-americas.ts`, `apps/catalogo/components/ficha/secciones.tsx`.
- Natural Earth (naturalearthdata.com), datos vía `nvkelso/natural-earth-vector`.
