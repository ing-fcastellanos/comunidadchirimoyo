## Context

El catálogo (`apps/catalogo`) es un export estático (ADR-0005/0014). Ya existen: `Header` (logo + "Buscar especies") y `Footer` (logo + lista "Fuentes", sin enlaces de navegación); primitivos visuales (`Section`, tarjetas tipo `GruposFauna`/`EspecieCard`); el patrón de loader de contenido (`lib/content.ts` con `node:fs`). La ruta `[grupo]` usa `dynamicParams=false` y `generateStaticParams` acotado a `aves|anfibios|reptiles`, por lo que un segmento estático `app/colaboradores/` tiene prioridad y no colisiona. Los `credito` de foto son una mezcla: fotógrafos del proyecto (nombre limpio) + atribuciones CC externas de iNaturalist + grabadores de audio de xeno-canto. Solo los primeros son "colaboradores".

## Goals / Non-Goals

**Goals:**
- Página `/colaboradores` estática que reconoce al equipo (biólogos, fotografía, desarrollo), desde contenido curado.
- Reusar primitivos visuales del catálogo (sin v0.dev).
- Enlace visible desde el Footer; metadata propia.

**Non-Goals:**
- Categoría comunidad (va en `/comunidad` del sitio).
- Auto-agregar créditos; fotos de colaboradores; tocar fichas o API.

## Decisions

**D1 — Contenido curado en JSON, agrupado por rol.** `content/fauna/colaboradores.json` con una lista de grupos en orden de presentación, cada uno con `rol` (etiqueta) y `personas[]`. Estructura:
```json
{
  "grupos": [
    {
      "rol": "Biólogos e identificación",
      "icono": "Microscope",
      "personas": [
        { "nombre": "Juan Manuel Díaz García", "aporte": "Doctor en Ciencias Biológicas", "enlace": "https://web.facebook.com/juandiazgarcia" }
      ]
    }
  ]
}
```
Campos por persona: `nombre` (req), `aporte` (str, grado o contribución breve), `enlace` (opc), `foto` (opc, reservado para el futuro). El **orden** de `grupos` y `personas` se respeta tal cual (curaduría).

**D2 — Contenido real seed (con consentimiento).**
- **Biólogos e identificación:** Juan Manuel Díaz García (Doctor en Ciencias Biológicas), Angel Ivan Contreras Calvario (Maestro en Ciencias en Conservación y Aprovechamiento de Recursos Naturales), Ángel Hernández Ramírez (Licenciado en Biología) — cada uno con su Facebook.
- **Fotografía:** Any Isabel Pérez Santiago, Diana Isela Angeles Solares, Juan J. Morales-Trejo (derivados de los créditos de foto de nombre limpio del proyecto).
- **Desarrollo:** Francisco Castellanos.

**D3 — Loader tipado.** `lib/colaboradores.ts`: tipos `Colaborador`/`GrupoColaboradores`, y `getColaboradores()` que lee el JSON con `node:fs` en build (override `CONTENT_DIR`, como `content.ts`). Sin validación pesada; el archivo es curado y pequeño.

**D4 — Página estática group-by-rol.** `app/colaboradores/page.tsx` (Server Component): encabezado (eyebrow + título + intro de agradecimiento), y por cada grupo una sección con su `rol` y una grilla de tarjetas de persona (nombre, aporte, enlace si existe → `<a target="_blank" rel="noopener noreferrer">`). Reusa `Section` y el lenguaje de tarjetas de `GruposFauna`. Cierra con una **nota** que reconoce las fuentes externas: *"Muchas fichas incluyen además fotografías bajo licencia Creative Commons (iNaturalist) y grabaciones de xeno-canto; su autoría se acredita en cada ficha."*

**D5 — `generateMetadata`.** Exporta título ("Colaboradores · Guía de fauna del Chirimoyo"), descripción y OpenGraph, siguiendo el patrón de las demás páginas del catálogo.

**D6 — Enlace en el Footer.** Añadir a `Footer.tsx` un enlace `/colaboradores` (p. ej. una pequeña columna/línea "El proyecto → Colaboradores"). Se elige el Footer sobre el Header porque una página de reconocimiento vive junto a "Fuentes" y el Header se mantiene minimal (logo + buscar).

**D7 — Sin v0.dev.** El diseño (tarjetas agrupadas por categoría) se deriva del vocabulario visual existente; no amerita un handoff nuevo (CLAUDE.md permite reusar primitivos).

## Risks / Trade-offs

- **Juan J. Morales-Trejo** podría ser fotógrafo externo, no del proyecto → si el organizador lo indica, se quita del JSON (cambio de una línea, sin tocar código).
- **Enlaces a Facebook de terceros** → se abren con `rel="noopener noreferrer"`; son perfiles públicos aportados con consentimiento.
- **Footer sin nav previa** → añadir un enlace cambia levemente su layout; se mantiene discreto y consistente con el estilo actual.
- **Consentimiento** → los biólogos los aportó el organizador (implica permiso de aparecer); los fotógrafos ya figuran acreditados en el proyecto. Si alguien pide no aparecer, se elimina del JSON.

## Open Questions

- Ninguna que bloquee. La inclusión/exclusión de Juan J. Morales-Trejo y una eventual mención a IA en "desarrollo" se resuelven editando el JSON; el default es incluir a Morales-Trejo y listar solo a Francisco Castellanos en desarrollo.
