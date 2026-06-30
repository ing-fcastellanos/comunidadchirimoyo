## Context

`/voluntarios` (#22a) es un Server Component que ya carga `getEnlaces()` y monta `InscripcionForm` (cliente). El sitio corre en Cloud Run (`output: "standalone"`), así que puede renderizar en request y calcular fechas relativas a *hoy* (`new Date()` es válido en el código de la app — la restricción de `Date.now()` es solo de los scripts de workflow). El patrón de contenido es `content/<area>/*.json` + loader en `lib/`. `enlaces.json` ya tiene `jornadas.calendarioUrl` (Google Calendar). No existe `content/jornadas/`.

## Goals / Non-Goals

**Goals:**
- Jornadas como contenido en repo con recurrencia; listado de próximas en `/voluntarios`.
- Campo `jornada` del formulario como selección de próximas jornadas.

**Non-Goals:**
- Gestión de jornadas en el API; calendario interactivo propio; detalles finales del evento del 11 de julio; tocar el backend.

## Decisions

**D1 — Jornadas = contenido en repo, NO en el API.** ADR-0006 acota el API a inscripción + contacto ("no incluye generación de contenido… requiere un ADR nuevo"); ADR-0004 pone el contenido en `content/`. Por tanto `content/jornadas/jornadas.json`, editado por git/PR. *Alternativa descartada:* CRUD de jornadas en el API — habilitaría self-serve de organizadores no técnicos, pero rompe minimal-API y exige ADR; innecesario para jornadas recurrentes que cambian poco.

**D2 — Esquema `jornadas.json`.**
```jsonc
{
  "recurrentes": [
    { "slug": "limpieza", "titulo": "Jornada de limpieza", "tipo": "limpieza",
      "hora": "16:30", "lugar": "…", "inscripcion": true,
      "recurrencia": { "tipo": "semanal", "dia": "jueves" } },
    { "slug": "pajareada", "titulo": "Pajareada", "tipo": "pajareada",
      "hora": "10:00", "lugar": "…", "inscripcion": true,
      "recurrencia": { "tipo": "mensual-ordinal", "dia": "sabado", "ordinales": [1, 3] } }
  ],
  "eventos": [
    { "slug": "chirimoyo-itinerante", "titulo": "Chirimoyo Itinerante", "tipo": "evento",
      "fecha": "2026-07-11", "hora": "", "lugar": "", "inscripcion": true,
      "descripcion": "PLACEHOLDER — completar." }
  ]
}
```
`tipo ∈ {limpieza, pajareada, evento}`. `dia` en español (lunes…domingo). `ordinales` = posiciones del día en el mes (1=primer, 3=tercer).

**D3 — Expansión de recurrencia (`lib/jornadas.ts`).** `proximasJornadas(desde = hoy, dias = 60, max = 6)`:
- **semanal**: a partir de `desde`, las fechas del `dia` indicado dentro de la ventana.
- **mensual-ordinal**: para los meses que toca la ventana, el `ordinal`-ésimo `dia` del mes (p. ej. 1er y 3er sábado), si cae en `[desde, desde+dias]`.
- **eventos**: incluir si `fecha >= hoy` (a nivel día).
- Cada ocurrencia hereda `titulo/tipo/hora/lugar/inscripcion/slug` y lleva su `fecha` (ISO) calculada. Se **mezclan**, se ordenan por `fecha`+`hora` ascendente y se cortan a `max`. Cálculo con `Date` nativo; el `dia`→índice y el n-ésimo-día-del-mes son helpers puros y testeables.

**D4 — Sección "Próximas jornadas".** `components/voluntarios/ProximasJornadas.tsx` (Server Component): grilla de tarjetas (badge por `tipo`, fecha `Intl.DateTimeFormat("es-MX", { weekday, day, month })`, hora, lugar, descripción si hay). Si no hay próximas, no se renderiza (o muestra un aviso breve + el enlace al calendario).

**D5 — `revalidate` diario.** En `app/voluntarios/page.tsx`: `export const revalidate = 86400` (ISR), para que "hoy" avance y las fechas no se congelen en build, sin volver la página totalmente dinámica. *Alternativa:* `dynamic = "force-dynamic"` (recalcula por request) — más fresco pero sin caché; el diario es suficiente para granularidad de jornadas.

**D6 — Campo `jornada` como selección.** `InscripcionForm` recibe un prop opcional `jornadas?: { value: string; label: string }[]`. Si llega no vacío, el campo `jornada` renderiza un `<select>` con esas opciones + "Otra / disponibilidad general" (value vacío). Si no llega, **degrada** al input de texto actual. El value enviado al API es el `label`/string elegido (el contrato #21 no cambia). La página construye las opciones desde `proximasJornadas()` (etiqueta tipo "Jornada de limpieza — jue 3 jul, 16:30").

**D7 — Zona horaria (suave).** Las jornadas son locales (Veracruz). Para v1 se calculan y formatean con `Date`/`Intl` sin forzar TZ; la granularidad (día) tolera el desfase de pocas horas. Si se vuelve un problema, se fija `timeZone` en el formateo. Documentado como nota.

## Risks / Trade-offs

- **Recurrencia mensual-ordinal** (1er/3er sábado) → lógica algo más delicada que semanal; helper puro + casos de borde (mes sin 5º sábado, etc.). Mitigado con función dedicada.
- **Congelar fechas en build** → resuelto con `revalidate` diario.
- **Evento placeholder** → "Chirimoyo Itinerante" sale con datos mínimos hasta que el usuario complete; marcado en el JSON.
- **TZ** → aceptado a nivel día; nota para endurecer si hace falta.
- **`select` vs texto libre** → mejora UX y consistencia de datos; al degradar a texto si no hay jornadas, no se rompe nada.

## Migration Plan

Sin migración: contenido nuevo + loader + sección + ajuste del form. Deploy normal (ISR diario). Rollback = revertir el commit (vuelve el campo de texto libre y desaparece el listado).

## Open Questions

- **Ventana/cantidad** de próximas (60 días / 6 tarjetas) — valores por defecto razonables, ajustables.
- **Lugar exacto** de limpieza/pajareada y detalles del evento del 11 — placeholder; el usuario los edita en el JSON.
