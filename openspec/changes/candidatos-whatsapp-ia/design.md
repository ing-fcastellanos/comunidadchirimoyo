## Context

`apps/admin` ya tiene el patrón establecido para features de este tipo (noticias, jornadas, voluntarios): Server Actions con Firebase Admin SDK (ADR-0030, sin extender `services/api`), Firestore con reglas `deny-all` para el client SDK, sesión `__session` verificada en `(authed)/layout.tsx` sin RBAC (ADR-0029).

Esta feature agrega un origen de datos nuevo — texto plano exportado de WhatsApp — y una dependencia externa nueva — la API de OpenAI — que no existen hoy en el proyecto. El resto (listado, formularios, revalidación del sitio) reutiliza patrones ya presentes en `noticias-admin`/`jornadas-admin`.

Los 3 grupos de WhatsApp de origen son fijos y conocidos de antemano (no se prevé agregar/quitar grupos con frecuencia).

## Goals / Non-Goals

**Goals:**
- Subir un export de chat (`.txt`, formato nativo de WhatsApp) y obtener una lista de candidatos clasificados y revisables desde el admin.
- Evitar reprocesar mensajes ya analizados en una subida anterior del mismo grupo.
- No persistir el texto crudo del chat más allá de la duración del request que lo procesa.
- Permitir aprobar un candidato con el menor esfuerzo posible: prellenar el formulario ya existente (noticia/jornada/evento) o generar el fragmento JSON a copiar (logro/aliado).
- Redacción de noticias con tono seleccionable, como paso explícito y posterior a la extracción (no en el mismo request de subida).

**Non-Goals:**
- No automatizar la extracción del chat desde WhatsApp (nada de whatsapp-web.js/Baileys/API no oficial). La subida siempre es un acto manual del staff.
- No agregar CRUD para `logros`/`aliados` — siguen siendo JSON estático en `content/` (ADR-0004). Esta feature solo genera el fragmento a pegar.
- No agregar Cloud Scheduler ni cadencia automática — el proceso ocurre únicamente cuando alguien sube un export.
- No dar de alta/baja grupos de WhatsApp dinámicamente desde la UI en esta primera versión (los 3 grupos son una constante de configuración).
- No hacer streaming/progreso en tiempo real del procesamiento — la subida es sincrónica (esperar a que termine la extracción antes de mostrar los candidatos nuevos).

## Decisions

### D1. Parseo del export en el propio Route Handler de subida, sin almacenamiento intermedio
El archivo `.txt` llega como `multipart/form-data` a un Route Handler de `apps/admin` (`app/api/candidatos/subir/route.ts`), se lee a string en memoria, se parsea línea por línea con el formato estándar de export de WhatsApp (`DD/MM/YY, HH:mm - Remitente: mensaje`), se filtra por el corte de fecha del grupo (D3) y se descarta la variable tras extraer los mensajes relevantes — nunca se escribe a disco, GCS ni Firestore. Alternativa descartada: subir el `.txt` a GCS (patrón ya usado por portadas) y procesarlo después — se descarta porque contradice la decisión explícita de no retener el chat crudo (privacidad, espíritu ADR-0012) y no aporta valor aquí (no hay necesidad de reprocesar el mismo archivo más tarde).

### D2. Corte de fecha por grupo en un documento fijo, no en la colección de candidatos
Se agrega una colección pequeña `candidatos_grupos` (3 documentos fijos, uno por grupo, doc ID = slug del grupo) con `{ nombre, ultimoCorte: Timestamp | null }`. Al subir un export para un grupo, el sistema lee `ultimoCorte`, filtra mensajes con fecha posterior, y si el resultado no está vacío, tras la extracción exitosa actualiza `ultimoCorte` a la fecha del último mensaje incluido en el lote. Si el filtro no deja mensajes, el Route Handler responde sin llamar a OpenAI. Alternativa descartada: guardar el corte como campo dentro de cada candidato — se descarta porque el corte es un dato por-grupo, no por-candidato, y mezclarlo complica la consulta "¿cuál es el último corte de este grupo?" (requeriría ordenar candidatos en vez de leer un documento).

### D3. Colección `candidatos` con estado y estructura mínima
```
candidatos/{id} (auto-ID)
  grupoId: string            // referencia a candidatos_grupos/{grupoId}
  grupoNombre: string        // denormalizado, para no hacer join al listar
  tipo: "noticia" | "jornada" | "evento" | "logro" | "aliado"
  resumen: string            // extracto/resumen generado por la IA
  fechaMensaje: Timestamp | null   // fecha del mensaje origen, si la IA la identificó
  confianza: "alta" | "media" | "baja"
  estado: "pendiente" | "aprobado" | "descartado"
  tono: string | null        // solo se llena si tipo=noticia y ya se redactó (D6 fase 2)
  redaccion: string | null   // cuerpo redactado por la IA en el tono elegido, solo noticia
  creadoEn: Timestamp
  revisadoEn: Timestamp | null
```
Reglas de Firestore: `deny-all` para el client SDK, igual que `noticias`/`jornadas`/`voluntarios_inscripciones` — todo acceso desde `apps/admin` server-side vía Firebase Admin SDK.

### D4. Dos llamadas a OpenAI, con Structured Outputs (JSON Schema), nunca texto libre a parsear con regex
- **Llamada 1 (extracción/clasificación, al subir)**: recibe el lote de mensajes nuevos de un grupo, devuelve un array de candidatos con `tipo`, `resumen`, `fechaMensaje`, `confianza` — forzado por JSON Schema en `response_format`. Si el modelo no puede clasificar un mensaje irrelevante (saludo, chat casual), lo omite — el prompt indica explícitamly extraer solo contenido potencialmente publicable.
- **Llamada 2 (redacción con tono, al revisar un candidato de tipo noticia)**: recibe el `resumen` del candidato + el tono elegido (uno de los 6 del catálogo) y devuelve el cuerpo de la noticia redactado en ese tono. Se dispara desde un Server Action separado (`redactarConTono(candidatoId, tono)`), no en la subida — coherente con D6 (tono se elige al interactuar, no antes).
Alternativa descartada: una sola llamada que ya redacte todo en la fase de extracción — se descarta porque el tono es una decisión humana posterior, y redactar 5 tonos por candidato "por si acaso" desperdicia llamadas para candidatos que ni siquiera se van a aprobar.

### D5. `OPENAI_API_KEY` como variable de entorno en Cloud Run, no en `.env` versionado
Mismo patrón que `MAIL_PASSWORD` en `services/api`: se inyecta vía `gcloud run services update admin --update-secrets` o `--set-env-vars` (a definir en el runbook de deploy, no en esta feature) y se documenta en `apps/admin/README.md`. Nunca se commitea, nunca aparece en `.env.production`.

### D6. Aprobación asimétrica reutilizando UI existente
- `noticia` / `jornada` / `evento`: el botón "Aprobar" navega al formulario de creación ya existente (`/noticias/nueva`, `/jornadas/nueva`) con los campos relevantes pasados como estado inicial (vía query params serializados o un pequeño store de sesión) — el humano revisa/edita y confirma con el mismo Server Action de creación que ya existe (`noticias-admin`/`jornadas-admin`, sin tocar su contrato).
- `logro` / `aliado`: el botón "Aprobar" genera un fragmento JSON (con la forma exacta de un elemento de `hitos`/`aliados` en `content/landing/{logros,aliados}.json`) mostrado en un `<pre>` con botón de copiar — el humano lo pega a mano en el archivo y hace el PR correspondiente. No se escribe a `content/` automáticamente (ADR-0004, no hay CRUD para estos dos tipos).
- En ambos casos, aprobar marca el candidato como `estado: "aprobado"` en Firestore (no se borra — queda como historial de qué ya se procesó).

### D7. Listado con filtros por tipo, grupo y estado — mismo patrón que `panel-voluntarios-admin`
Vista `/candidatos` con filtros combinables (tipo, grupo, estado pendiente/aprobado/descartado) y una vista de detalle por candidato (`/candidatos/[id]`) donde vive la acción de redactar-con-tono (solo noticias) y aprobar/descartar.

## Risks / Trade-offs

- **[Riesgo] Enviar mensajes de terceros (miembros del grupo que no dieron consentimiento explícito) a la API de OpenAI** → Mitigación: se envía solo el lote de mensajes nuevos necesario para la extracción (no el historial completo cada vez, gracias a D2), el texto crudo se descarta inmediatamente tras el request (D1), y solo persiste un resumen ya reelaborado por la IA — no el mensaje original palabra por palabra. Se documenta esta decisión en el proposal como espíritu de ADR-0012, aunque no aplica literalmente (no es PII de voluntarios) — vale la pena que el equipo avise informalmente a los grupos que este análisis ocurre.
- **[Riesgo] El formato de export de WhatsApp puede variar ligeramente entre versiones de la app (12h vs 24h, separadores de fecha)** → Mitigación: el parser soporta el formato más común (`DD/MM/YY, HH:mm - Remitente: mensaje`) documentado por WhatsApp; si una línea no matchea el patrón esperado, se descarta silenciosamente esa línea en vez de fallar toda la subida (favorece degradación suave sobre un error duro).
- **[Riesgo] Falsos positivos/negativos de clasificación de la IA** → Mitigación: el campo `confianza` permite priorizar revisión; todo candidato pasa por revisión humana antes de aprobarse (no hay publicación automática en ningún caso).
- **[Trade-off] Procesamiento sincrónico en el Route Handler de subida** → si el lote de mensajes nuevos es grande, el request puede tardar (llamada a OpenAI + parseo). Aceptable para el volumen esperado (subidas manuales, no muy frecuentes); si se vuelve un problema, se puede mover a un job asíncrono en una iteración futura — no se diseña para eso ahora (YAGNI).
- **[Trade-off] Sin edición del catálogo de 3 grupos desde la UI** → agregar/quitar un grupo requiere un cambio de código (constante) en vez de un formulario de administración. Aceptable dado que los 3 grupos son estables; se documenta como mejora futura si cambia la realidad.

## Migration Plan

- Feature aditiva: nueva colección Firestore, nueva ruta en `apps/admin`, ningún dato ni endpoint existente cambia de forma incompatible.
- Antes del primer deploy: crear los 3 documentos fijos en `candidatos_grupos` (vía script o consola de Firestore) con `ultimoCorte: null`, desplegar reglas de Firestore actualizadas (`deny-all` para la nueva colección), y configurar `OPENAI_API_KEY` en el servicio Cloud Run de `admin`.
- Rollback: al ser aditiva, revertir es remover la ruta/UI del admin; no hay migración de datos existentes que deshacer.

## Open Questions

Ninguna pendiente de decisión del usuario — todas las decisiones de producto quedaron cerradas en la exploración. Detalles de implementación menores (nombre exacto de campos, copy de la UI) se resuelven durante `/opsx:apply`.
