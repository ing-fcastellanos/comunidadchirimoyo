# Tasks — aviso-privacidad-retencion

## 1. Contenido

- [x] 1.1 `content/landing/privacidad.md` — añadir la sección `## Cuánto tiempo conservamos tus datos` (entre "Cómo los resguardamos" y "Tus derechos (ARCO)"): los datos se conservan solo mientras son útiles para responder/organizar; las inscripciones se borran pasado un tiempo razonable (≈12 meses tras la jornada); se pueden borrar antes a solicitud (remite a ARCO). Coherente con ADR-0012 y el script del API (#21)
- [x] 1.2 Actualizar `actualizado` en el frontmatter a la fecha de hoy; mantener `estado: borrador`

## 2. Footer

- [x] 2.1 `apps/sitio/components/layout/Footer.tsx` — reemplazar el comentario obsoleto sobre `LEGALES`/`/privacidad` (que dice que no existe y cae en 404) por uno correcto (la página existe; el aviso está en borrador hasta revisión legal). Sin cambiar el enlace ni el render

## 3. Verificación

- [x] 3.1 `npm run build` en `apps/sitio` sin errores
- [x] 3.2 Dev: `/privacidad` muestra la nueva sección de retención (entre resguardo y ARCO), el banner de borrador sigue, y el resto del aviso intacto
- [x] 3.3 Confirmar que ningún comentario del repo afirma ya que `/privacidad` no existe / cae en 404