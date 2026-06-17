## Context

El formulario de contacto (#48) ya está en producción y siembra dos enlaces a `/privacidad` (Footer y casilla de consentimiento) que hoy caen en 404. El ADR-0012 fija el marco legal (LFPDPPP) y decide que el texto del aviso vive en `content/` y se versiona. La app `apps/sitio` ya tiene dos patrones de contenido consolidados: markdown con secciones (`lucha.md` → `getLucha`) y JSON estructurado (`aliados.json` → `readJson`). Esta es una pieza acotada de frontend + contenido; no toca el API ni Firestore.

## Goals / Non-Goals

**Goals:**
- Publicar `/privacidad` como página estática, única fuente de verdad del aviso.
- Mantener el contenido editable en `content/` sin tocar código.
- Cero dependencias nuevas (decisión confirmada en explore).
- Coherencia textual con el manejo de PII real (ADR-0012).

**Non-Goals:**
- Markdown inline (links clicables, viñetas tipográficas) — texto plano por sección basta para Fase 3.
- Componente de aviso embebible/reutilizable — una página enlazable cumple.
- Redactar el aviso específico de voluntariado (Fase 4).
- Validación jurídica formal — el aviso se publica como borrador.

## Decisions

**D1 — Patrón de contenido: markdown con secciones (gemelo de `lucha.md`).**
El aviso es texto largo seccionado; encaja con el parser de `## H2` que ya usa `getLucha()`. Alternativa descartada: JSON estructurado (`aliados.json`-style) — fuerza al redactor a pensar en estructura de datos en vez de prosa legal. Alternativa descartada: añadir `react-markdown` — dependencia nueva que requeriría justificación y no aporta para Fase 3 (opción A en explore).

**D2 — Nueva función `getAviso()` en `lib/landing.ts`.**
Reusa la mecánica de `getLucha` (gray-matter + split por `## H2` → `{titulo, cuerpo}[]`, más `actualizado` y `estado` del frontmatter). Se prefiere una función dedicada sobre generalizar `getLucha` para no acoplar dos contenidos con frontmatter distinto.

**D3 — Página molde de `/aliados`.**
`app/privacidad/page.tsx` como Server Component async: `<Section>` + título + fecha + recorrido de secciones. `metadata.title = "Aviso de privacidad"`. Consistente con las páginas de contenido existentes.

**D4 — Marca de borrador.**
`estado: borrador` en frontmatter → la página muestra un aviso visible de "borrador pendiente de revisión". Evita que un texto no validado legalmente se presente como definitivo. Se retira cambiando el frontmatter cuando haya revisión.

**D5 — Responsable colectivo.**
No hay figura legal individual: el responsable es el colectivo **Comunidad Chirimoyo**, contacto **contacto@chirimoyo.org**. Es el nivel de identificación viable para un proyecto comunitario; se revisa si el proyecto adquiere personalidad jurídica.

## Risks / Trade-offs

- **[Texto legal redactado sin abogado]** → se publica explícitamente como borrador (D4); el ADR-0012 acota el contenido mínimo; revisión legal queda como tarea de seguimiento fuera de este change.
- **[Email/derechos ARCO sin link clicable por opción A]** → se escriben como texto plano legible; convertirlos en links es un cambio chico futuro en el componente de render, no en el contenido.
- **[Divergencia entre lo que dice el aviso y el manejo real de PII]** → el spec exige coherencia con ADR-0012; se valida en revisión del change.

## Migration Plan

Cambio puramente aditivo: nuevos archivos, sin migración de datos ni de rutas. Deploy junto con el resto de `apps/sitio` (Cloud Run + Hosting, issue #53). Rollback = revertir el commit; los enlaces sembrados vuelven a 404 (estado previo), sin efectos colaterales.

## Open Questions

- ¿Domicilio del responsable? La LFPDPPP suele pedirlo; para un colectivo sin sede se omite o se usa el medio de contacto. Se asume **solo email** por ahora; revisar en validación legal.
- ¿Política de retención concreta? El ADR-0012 la difiere a Fase 4; el aviso puede mencionarla de forma general sin comprometer plazos aún.
