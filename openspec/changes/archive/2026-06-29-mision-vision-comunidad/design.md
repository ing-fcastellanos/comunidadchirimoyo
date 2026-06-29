## Context

`/comunidad` (#19a) compone: intro → ElCaso → **[slot]** → QueHacemos → LineaTiempo → Noticias. El slot entre ElCaso y QueHacemos es para Misión/Visión. El data-layer `lib/landing.ts` ya tiene el helper `readJson<T>(file)` y loaders como `getActividades = () => readJson<Actividades>("actividades.json")`. El contenido vive en `content/landing/`. Los componentes de comunidad están en `components/comunidad/`. Patrón de placeholder: `logros.json` usa un campo `_nota` y textos marcados `PLACEHOLDER`.

## Goals / Non-Goals

**Goals:**
- Sección Misión/Visión montada en `/comunidad`, derivada de contenido curado.
- Estructura lista; texto real se completa después editando el JSON.

**Non-Goals:**
- Redactar el texto institucional; tocar otras secciones; mover contenido a `content/comunidad/`.

## Decisions

**D1 — Contenido `content/landing/mision-vision.json` (placeholder).** Estructura:
```json
{
  "_nota": "PLACEHOLDER — redactar misión, visión y valores con la comunidad.",
  "mision": { "titulo": "Misión", "texto": "PLACEHOLDER …" },
  "vision": { "titulo": "Visión", "texto": "PLACEHOLDER …" },
  "valores": [ { "titulo": "PLACEHOLDER", "descripcion": "PLACEHOLDER", "icono": "Sprout" } ]
}
```
`valores` es opcional (lista corta de principios con icono lucide). Los textos placeholder son legibles pero claramente provisionales.

**D2 — Loader + tipos en `lib/landing.ts`.** `interface MisionVision { mision: { titulo: string; texto: string }; vision: { titulo: string; texto: string }; valores?: { titulo: string; descripcion: string; icono?: IconName }[] }` y `export const getMisionVision = () => readJson<MisionVision>("mision-vision.json")`. Mismo patrón que `getActividades`.

**D3 — Componente `components/comunidad/MisionVision.tsx`.** Server Component `{ data: MisionVision }`: `SectionTitle` (kicker "Comunidad", "Misión y visión"); dos tarjetas/columnas (Misión y Visión) con su título y texto; si `valores` tiene entradas, una fila de valores (título + descripción + icono). Reusa `Section`/`SectionTitle`/`Icon` y tokens; tolera `valores` ausente/vacío.

**D4 — Insertar en `/comunidad`.** `app/comunidad/page.tsx`: cargar `getMisionVision()` (en el `Promise.all` existente) y renderizar `<MisionVision data={...} />` **entre** `<ElCaso/>` y `<QueHacemos/>`.

**D5 — Documentación.** Añadir el esquema de `mision-vision.json` a `content/landing/README.md` (o `content/README.md`), notando que arranca como placeholder.

**D6 — Sin v0.dev.** Diseño simple (2 columnas + valores) derivado de los primitivos.

## Risks / Trade-offs

- **Placeholder visible en prod** → la sección se ve con texto provisional hasta que la comunidad lo redacte. Mitigación: textos legibles y marcados; el `_nota` recuerda completarlos. (Alternativa descartada: ocultar la sección si es placeholder — se prefiere mostrarla montada para que el hueco sea evidente y se llene.)
- **`valores` opcional** → el componente debe tolerar su ausencia sin romper el layout. Cubierto.

## Migration Plan

Sin migración: un JSON nuevo + loader + componente + 3 líneas en la página. Build normal. Rollback = revertir el commit (la sección desaparece).

## Open Questions

- ¿Mostrar "valores" en v1 o solo misión/visión? Por defecto se incluye `valores` (opcional) con 2-3 entradas placeholder; si la comunidad no los quiere, se vacía el array y la fila no se renderiza.
