# content/noticias/

Notas de comunidad de **chirimoyo.org/comunidad** (épica #20). Cada nota es **un archivo Markdown con frontmatter** en `content/noticias/<slug>.md`. El data-layer está en [`apps/sitio/lib/noticias.ts`](../../apps/sitio/lib/noticias.ts) y el cuerpo se renderiza con [`components/ui/Markdown.tsx`](../../apps/sitio/components/ui/Markdown.tsx) (`react-markdown`, [ADR-0026](../../docs/decisions/0026-renderizador-markdown.md)).

> Las notas son **contenido público**: no incluyas datos personales ni sensibles.

## Frontmatter

| Campo | Tipo | Requerido | Nota |
|---|---|---|---|
| `titulo` | string | sí | |
| `slug` | string | sí | kebab-case; **debe coincidir** con el nombre del archivo (`<slug>.md`) |
| `fecha` | string | sí | ISO `YYYY-MM-DD` (se ordena por este campo, descendente) |
| `resumen` | string | sí | una o dos frases; se usa en el listado y OpenGraph |
| `estado` | `borrador` \| `publicado` | sí | en **producción** solo se muestran las `publicado`; en desarrollo también las `borrador` |
| `autor` | string | no | |
| `portada` | string | no | ruta de imagen en el bucket de comunidad (ADR-0021); se resuelve con `mediaUrl` |
| `portadaAlt` | string | no | **obligatorio si hay `portada`** (accesibilidad) |
| `tags` | string[] | no | etiquetas en kebab-case |

## Cuerpo (markdown editorial)

Soporta encabezados (`##`, `###`), párrafos, **negrita**/_énfasis_, listas, enlaces, citas (`>`), código, reglas (`---`), tablas (GFM) e imágenes. **No** se permite HTML crudo (seguro por construcción, ADR-0026).

- **Imágenes en el cuerpo:** usa la **URL absoluta** del bucket de comunidad (`![texto alternativo](https://storage.googleapis.com/comunidad-chirimoyo/noticias/<archivo>.webp)`). Los `remotePatterns` de `next.config` ya cubren ese host; el sitio las sirve con `next/image` (banda ancha, proporción 16:9). Optimiza las imágenes antes de subirlas; nombres en kebab-case.
- **Enlaces:** los externos se abren en pestaña nueva de forma segura; los internos (`/comunidad/...`) usan la navegación del sitio.

## Convenciones

- Nombre de archivo y `slug` en **kebab-case** y coincidentes.
- `fecha` siempre ISO. Una nota nueva nace en `estado: borrador` hasta revisarla; cámbiala a `publicado` para que salga en producción.
- Archivos con prefijo `_` y este `README.md` se ignoran.
