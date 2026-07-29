## 1. Firestore: modelo de datos y reglas

- [x] 1.1 Definir y documentar el esquema de `candidatos/{id}` y `candidatos_grupos/{grupoId}` (ver design.md D2/D3)
- [x] 1.2 ~~Crear los 3 documentos fijos en `candidatos_grupos`~~ — simplificado durante apply: los 3 grupos son una constante de código (`GRUPOS_WHATSAPP`), no requieren documento propio; `candidatos_grupos/{grupoId}` solo guarda `ultimoCorte` y se crea de forma perezosa (`set({merge:true})`) en la primera subida de ese grupo, sin necesidad de un seed manual
- [x] 1.3 Reglas `deny-all` para `candidatos` y `candidatos_grupos` — ya cubierto: `services/api/firestore.rules` es un `match /{document=**} { allow read, write: if false; }` a nivel de base de datos completa, no requiere cambios
- [x] 1.4 Índices compuestos para las combinaciones de filtro más comunes (`estado`+`creadoEn`, `tipo`+`estado`+`creadoEn`, `grupoId`+`estado`+`creadoEn`) en `firestore.indexes.json` — igual que con noticias, requiere `firebase deploy --only firestore:indexes` explícito antes de producción (el emulador no lo exige, ver gotcha ya documentado del proyecto). Si en producción se combinan los 3 filtros a la vez (tipo+grupo+estado), Firestore puede pedir un índice adicional la primera vez — el error trae el link directo para crearlo, mismo flujo que siempre.

## 2. Parser de export de WhatsApp

- [x] 2.1 Implementar parser de `.txt` de export de WhatsApp (formato `DD/MM/YY, HH:mm - Remitente: mensaje`), tolerante a líneas que no matcheen el patrón
- [x] 2.2 Implementar filtro de mensajes por corte de fecha (`ultimoCorte` del grupo)
- [x] 2.3 Pruebas manuales del parser con muestras representativas (mensaje simple, multilínea, mensaje de sistema sin remitente, BOM) — cubre los casos reales que produce el export nativo; sin un export real de los 3 grupos disponible en este entorno

## 3. Integración con OpenAI

- [x] 3.1 Agregar `OPENAI_API_KEY` a `.env.example` y documentar su inyección en Cloud Run (README)
- [x] 3.2 Implementar cliente/wrapper server-only para llamadas a OpenAI (mismo patrón lazy-singleton que `lib/firestore.ts`/`lib/storage.ts`)
- [x] 3.3 Definir el JSON Schema de salida para la extracción/clasificación (candidato: tipo, resumen, fechaMensaje, confianza) y forzarlo vía Structured Outputs
- [x] 3.4 Implementar la función de extracción/clasificación (llamada 1) a partir del lote de mensajes filtrado
- [x] 3.5 Implementar la función de redacción con tono (llamada 2), a partir de resumen + tono elegido
- [x] 3.6 Manejo explícito del error cuando falta `OPENAI_API_KEY` o la llamada a OpenAI falla (sin exponerlo como error del archivo subido)

## 4. Backend del admin (Server Actions / Route Handlers)

- [x] 4.1 Route Handler `app/api/candidatos/subir/route.ts`: recibe el `.txt` + grupo, parsea, filtra por corte, descarta el archivo, llama a extracción si hay mensajes nuevos, persiste candidatos y actualiza `ultimoCorte`
- [x] 4.2 `lib/candidatos/read.ts`: lectura server-side de candidatos con filtros (tipo, grupo, estado)
- [x] 4.3 `lib/candidatos/actions.ts`: Server Actions para `redactarConTono(candidatoId, tono)`, `aprobarCandidato(candidatoId)`, `descartarCandidato(candidatoId)`
- [x] 4.4 Función que arma el fragmento JSON de logro/aliado a partir de un candidato aprobado (forma exacta de `content/landing/{logros,aliados}.json`)
- [x] 4.5 Función que arma los valores de prellenado para el formulario de noticia/jornada/evento a partir de un candidato aprobado

## 5. UI del admin

- [x] 5.1 ~~Usar Claude Design (v0.dev)~~ — decisión durante apply: se reutilizan directamente los componentes/tokens ya establecidos (forest/mint, `Icon`, `Campo`/`Select`, badges, `FiltrosBar` link-based, botones con confirmación inline) en vez de una pasada nueva de v0.dev — las 3 pantallas son composiciones directas de patrones ya probados (lista+filtros+badges de noticias/voluntarios, upload de PortadaUpload), a diferencia de las pantallas originales de login/CRUD que no tenían precedente local. Si se quiere una exploración visual más novedosa, se puede correr Claude Design en una iteración posterior.
- [x] 5.2 `app/(authed)/candidatos/page.tsx`: listado con filtros por tipo/grupo/estado
- [x] 5.3 Componente de subida de export (selector de grupo + input de archivo `.txt`)
- [x] 5.4 `app/(authed)/candidatos/[id]/page.tsx`: detalle del candidato, selector de tono (solo noticia), acciones aprobar/descartar
- [x] 5.5 Wiring de "Aprobar" para noticia/jornada/evento: navega al formulario existente con los campos prellenados (prop `prellenado` agregado a `NoticiaFormulario`/`JornadaFormulario`, leído de `searchParams` en sus páginas `nueva/page.tsx`)
- [x] 5.6 Wiring de "Aprobar" para logro/aliado: muestra fragmento JSON copiable (`FragmentoJson`, visible cuando `estado === "aprobado"`)
- [x] 5.7 Agregar tarjeta "Candidatos" en `app/(authed)/dashboard/page.tsx`

## 6. Verificación

- [x] 6.1 Verificado en el emulator (Auth + Firestore) con candidatos de muestra sembrados: listado con filtros, detalle de noticia con selector de tono, aprobar noticia → redirige a `/noticias/nueva` con resumen/fecha prellenados, aprobar jornada → redirige a `/jornadas/nueva` con `kind=evento` + fecha prellenados, aprobar logro → revela el fragmento JSON copiable, tarjeta "Candidatos" en el dashboard. **No probado con un export real de los 3 grupos ni con una `OPENAI_API_KEY` real** (fuera de alcance de este entorno) — la llamada a la IA se verificó solo en su camino de error (ver 6.2/build).
- [x] 6.2 Verificado que si la extracción falla (sin `OPENAI_API_KEY`), el `ultimoCorte` NO avanza — una subida repetida del mismo export reintenta el mismo lote en vez de perderlo. El caso "extracción exitosa sin mensajes nuevos" se validó a nivel de lógica (`filtrarPosterioresA`), no con una clave real.
- [x] 6.3 Por diseño, el archivo nunca se escribe a ningún almacenamiento (se lee a `string` en memoria y se descarta al terminar el request) — no hay nada que verificar "después" en Firestore porque nunca se persiste antes.
- [x] 6.4 `apps/admin/README.md` actualizado con la sección "Candidatos de WhatsApp", `OPENAI_API_KEY` documentada en `.env.example` y aviso de renombrar los 3 placeholders de grupo antes de desplegar.

## 7. Hallazgos de producción (post-deploy)

- [x] 7.1 Parser tolerante a formatos reales de WhatsApp (MM/DD vs DD/MM heurístico, AM/PM, corchetes de iPhone, segundos) — el formato asumido originalmente no coincidía con un export real
- [x] 7.2 Procesamiento por lotes (`dividirEnLotes`): la primera subida de un grupo manda todo el historial, que puede exceder el contexto de una sola llamada a la IA; el cliente reintenta automáticamente hasta agotar los lotes, con progreso visible
- [x] 7.3 `trim()` defensivo en `OPENAI_API_KEY` y logging seguro (nunca el error crudo, que puede exponer el header Authorization) — un salto de línea en el secret rompía el header y el primer intento de loguear el error terminó exponiendo la key en Cloud Run logs (ya rotada)
- [x] 7.4 Paginación del listado (`getAllCandidatosAdmin` con `count()`+`offset()`+`limit()`, 20 por página) — a diferencia de noticias/jornadas/voluntarios, candidatos sí puede acumular volumen alto
- [x] 7.5 Cambio de estado inline desde el listado sin entrar al detalle: `Fila.tsx` compone `AprobarBoton`/`DescartarBoton` (prop `compacto`) cuando `estado === "pendiente"`, y un nuevo `RevertirBoton` (+ server action `revertirAPendiente`) cuando ya está aprobado/descartado — agregado también a la página de detalle por consistencia
