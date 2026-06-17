# content/landing — contenido de chirimoyo.org (landing)

Datos y textos que alimentan el **landing** (`www.chirimoyo.org`), la puerta de
entrada del proyecto. Contenido en repo (ADR-0004); la búsqueda y el render son
estáticos. Estos archivos son la **fuente de verdad** del contenido del landing;
las páginas (que se diseñan vía v0.dev → handoff) los consumen, no los duplican.

> ⚠️ **Estado: BORRADOR.** Los textos narrativos y varias entradas son
> _placeholders_ pensados para editarse tras la reunión con la comunidad.
> Lo que ya es dato real está marcado; el resto dice `PLACEHOLDER`.

## Archivos

| Archivo | Qué alimenta | Estado |
|---|---|---|
| `lucha.md` | Sección "el caso": qué es el humedal, la amenaza, qué pedimos | Borrador editable |
| `actividades.json` | "Qué hacemos": tarjetas de actividades de la comunidad | Datos reales (textos a pulir) |
| `logros.json` | Línea de tiempo de acciones y logros con fechas | Placeholders — completar |
| `enlaces.json` | Linktree: subdominios, redes, contacto, ubicación | Datos reales |
| `donaciones.json` | Métodos de donación | Datos reales + ideas futuras |
| `aliados.json` | Proyectos aliados (≥8) → alimenta `/aliados` | Placeholders — completar |
| `privacidad.md` | Aviso de privacidad → alimenta `/privacidad` | Borrador — revisar legalmente |

## Convenciones

- Fechas en ISO (`YYYY-MM-DD`, o `YYYY-MM` si el día es aproximado).
- `icono`: nombre de un ícono ya disponible en `components/ui/Icon` (lucide).
- Rutas de imágenes relativas a `public/` del app o al bucket (ADR-0016); por
  ahora `null` hasta que se suban las fotos (ver issue de galería).
- Strings en español; estructura preparada para i18n futura (ADR-0011): no
  partir frases ni concatenar texto traducible en el código.
