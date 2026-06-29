# Tasks — mision-vision-comunidad

## 1. Contenido

- [x] 1.1 Crear `content/landing/mision-vision.json` (PLACEHOLDER): `_nota` recordatorio + `mision {titulo,texto}` + `vision {titulo,texto}` + `valores[] {titulo,descripcion,icono}` (2-3 placeholder). Textos legibles pero marcados como provisionales
- [x] 1.2 Documentar el esquema en `content/landing/README.md` (campos + nota de que arranca como placeholder)

## 2. Loader + tipos

- [x] 2.1 `lib/landing.ts` — `interface MisionVision { mision: {titulo,texto}; vision: {titulo,texto}; valores?: {titulo,descripcion,icono?:IconName}[] }` (exportado) + `export const getMisionVision = () => readJson<MisionVision>("mision-vision.json")` (patrón de `getActividades`)

## 3. Componente

- [x] 3.1 `components/comunidad/MisionVision.tsx` — Server Component `{ data: MisionVision }`: `SectionTitle` (kicker "Comunidad", "Misión y visión"); dos tarjetas/columnas Misión y Visión (título + texto); si `valores?.length`, fila de valores (icono + título + descripción). Reusa `Section`/`SectionTitle`/`Icon` + tokens; tolera `valores` ausente

## 4. Insertar en /comunidad

- [x] 4.1 `app/comunidad/page.tsx` — añadir `getMisionVision()` al `Promise.all`; renderizar `<MisionVision data={misionVision} />` **entre** `<ElCaso/>` y `<QueHacemos/>`

## 5. Verificación

- [x] 5.1 `npm run typecheck` y `npm run build` en `apps/sitio` sin errores
- [x] 5.2 `/comunidad` (dev): la sección "Misión y visión" aparece entre "El caso" y "Qué hacemos", con misión, visión y valores placeholder
- [x] 5.3 Tolerancia: con `valores: []` la fila de valores no se renderiza y la página no rompe (revertir la prueba)
- [x] 5.4 JSON válido; el resto de `/comunidad` (caso, qué hacemos, línea de tiempo, noticias) intacto