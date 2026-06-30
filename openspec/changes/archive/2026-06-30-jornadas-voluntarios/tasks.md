# Tasks — jornadas-voluntarios

## 1. Contenido

- [x] 1.1 `content/jornadas/jornadas.json` — `recurrentes` (limpieza: semanal jueves 16:30; pajareada: mensual-ordinal sábado [1,3] 10:00) + `eventos` (chirimoyo-itinerante: 2026-07-11, "Chirimoyo Itinerante", resto placeholder). Campos: slug, titulo, tipo, hora, lugar, inscripcion, + recurrencia o fecha, descripcion?
- [x] 1.2 `content/jornadas/README.md` — esquema (recurrentes vs eventos, formato de recurrencia, días en español, ordinales) + nota de que el evento del 11 es placeholder

## 2. Loader + expansión de recurrencia

- [x] 2.1 `lib/jornadas.ts` — tipos (`Jornada`, `JornadaRecurrente`, `EventoJornada`, `Ocurrencia`); `getJornadas()` (readJson de `jornadas/jornadas.json`)
- [x] 2.2 Helpers puros: `diaIndice(nombre)` (lunes..domingo → 1..0), `nEsimoDiaDelMes(anio, mes, diaIdx, ordinal)`, y `proximasJornadas(desde=hoy, dias=60, max=6)` que expande semanal + mensual-ordinal, intercala eventos futuros, ordena por fecha+hora, corta a `max`; excluye pasadas
- [x] 2.3 `etiquetaOcurrencia(o)` → texto "<titulo> — <fecha es-MX corta>, <hora>" (para opciones del select)

## 3. Sección "Próximas jornadas"

- [x] 3.1 `components/voluntarios/ProximasJornadas.tsx` (Server Component) — grilla de tarjetas: badge por `tipo`, fecha `Intl.DateTimeFormat("es-MX", {weekday,day,month})`, hora, lugar, descripción si hay; si la lista está vacía, aviso breve + apoyo en el enlace al calendario

## 4. Conectar el formulario

- [x] 4.1 `components/voluntarios/InscripcionForm.tsx` — prop opcional `jornadas?: { value: string; label: string }[]`; si llega no vacío, renderizar el campo `jornada` como `<select>` (opciones + "Otra / disponibilidad general", value vacío); si no, degradar al input de texto actual. El value enviado al API sigue siendo string
- [x] 4.2 Validación: `validarInscripcion` ya trata `jornada` como string opcional ≤160 → sin cambios (el label de las opciones cabe)

## 5. Página /voluntarios

- [x] 5.1 `app/voluntarios/page.tsx` — `export const revalidate = 86400`; cargar `proximasJornadas()`; montar `<ProximasJornadas .../>` (entre la intro/calendario y el formulario); pasar las opciones (`etiquetaOcurrencia`) a `<InscripcionForm jornadas={...} />`

## 6. Verificación

- [x] 6.1 `npm run typecheck` y `npm run build` en `apps/sitio` sin errores; JSON válido
- [x] 6.2 Helpers de recurrencia: probar que `proximasJornadas` con una fecha fija devuelve los próximos jueves y el 1er/3er sábado correctos, incluye el evento del 11-jul si está en ventana, y excluye pasadas (test ad-hoc con fecha inyectada)
- [x] 6.3 Dev: `/voluntarios` muestra "Próximas jornadas" (fechas/horas correctas) + el formulario con el campo `jornada` como `<select>` poblado; enviar selecciona una jornada (string al API)
- [x] 6.4 Degradación: con `jornadas=[]` el campo vuelve a texto libre; el resto del sitio intacto