## ADDED Requirements

### Requirement: Subida de export de WhatsApp etiquetada por grupo

`apps/admin` SHALL ofrecer una vista (`app/(authed)/candidatos`) donde el staff sube un archivo `.txt` de export de chat de WhatsApp (función nativa "Exportar chat", sin medios) y selecciona a cuál de los 3 grupos de WhatsApp de la comunidad configurados corresponde. El sistema SHALL rechazar la subida si no se selecciona un grupo.

#### Scenario: Subida exitosa con grupo seleccionado
- **WHEN** el staff sube un `.txt` y selecciona uno de los 3 grupos configurados
- **THEN** el sistema procesa el archivo asociando los candidatos resultantes a ese grupo

#### Scenario: Subida sin grupo seleccionado
- **WHEN** el staff intenta subir un archivo sin seleccionar un grupo
- **THEN** la subida se rechaza sin llamar a la IA

### Requirement: Filtro de mensajes por corte de fecha, por grupo

El sistema SHALL mantener un corte de fecha (`ultimoCorte`) por cada uno de los 3 grupos, en una colección `candidatos_grupos`. Al procesar una subida, el sistema SHALL descartar del análisis todo mensaje con fecha igual o anterior al `ultimoCorte` del grupo correspondiente, y SHALL enviar a la IA únicamente los mensajes posteriores. Si no hay mensajes posteriores al corte, el sistema NO SHALL invocar la IA.

#### Scenario: Primera subida de un grupo sin corte previo
- **WHEN** se sube un export para un grupo cuyo `ultimoCorte` es nulo
- **THEN** todos los mensajes del export se envían a la IA para su análisis

#### Scenario: Subida sin mensajes nuevos desde el último corte
- **WHEN** se sube un export cuyo mensaje más reciente es anterior o igual al `ultimoCorte` guardado del grupo
- **THEN** el sistema no invoca la IA y reporta que no hay mensajes nuevos que analizar

#### Scenario: El corte se actualiza tras un análisis exitoso
- **WHEN** una subida produce candidatos nuevos a partir de mensajes posteriores al corte
- **THEN** el `ultimoCorte` del grupo se actualiza a la fecha del mensaje más reciente incluido en ese análisis

### Requirement: El archivo de chat crudo no se persiste

El sistema NO SHALL almacenar el contenido del archivo `.txt` subido (ni en Firestore ni en almacenamiento de objetos) más allá de la duración del procesamiento de la subida. Tras extraer los candidatos, el texto de los mensajes originales SHALL descartarse.

#### Scenario: Sin rastro del archivo tras procesar
- **WHEN** una subida termina de procesarse (con o sin candidatos nuevos)
- **THEN** no queda ningún documento ni objeto en el sistema que contenga el texto completo del archivo subido

### Requirement: Extracción y clasificación de candidatos con IA

Al procesar los mensajes nuevos de una subida, el sistema SHALL invocar la API de OpenAI para extraer candidatos de contenido publicable y clasificar cada uno en uno de 5 tipos: `noticia`, `jornada`, `evento`, `logro`, `aliado`. Cada candidato extraído SHALL guardarse en la colección `candidatos` con al menos: grupo de origen, tipo, resumen, fecha del mensaje origen (si se identificó), nivel de confianza, y estado inicial `pendiente`.

#### Scenario: Extracción produce candidatos de distintos tipos
- **WHEN** el lote de mensajes nuevos contiene menciones de una jornada próxima y de un reconocimiento reciente
- **THEN** se crean candidatos separados, uno clasificado como `jornada` y otro como `logro`, cada uno en estado `pendiente`

#### Scenario: Mensajes sin contenido publicable no generan candidatos
- **WHEN** el lote de mensajes nuevos no contiene menciones de actividades, noticias, logros o proyectos aliados
- **THEN** no se crea ningún candidato para esa subida

### Requirement: Listado de candidatos con filtros y paginación

`apps/admin` SHALL ofrecer un listado de candidatos filtrable por tipo, por grupo de origen y por estado (`pendiente`, `aprobado`, `descartado`). Cada fila SHALL mostrar al menos: tipo, grupo de origen, resumen, confianza y estado. A diferencia de otras listas del admin de bajo volumen (noticias, jornadas, voluntarios), el listado de candidatos SHALL paginarse (20 por página), ya que puede acumular volumen alto tras varias subidas.

#### Scenario: Filtrar por estado pendiente
- **WHEN** se aplica el filtro de estado `pendiente`
- **THEN** el listado muestra solo los candidatos que aún no fueron aprobados ni descartados

#### Scenario: Filtrar por grupo de origen
- **WHEN** se aplica el filtro de uno de los 3 grupos
- **THEN** el listado muestra solo los candidatos extraídos de exports de ese grupo

#### Scenario: Navegar a la siguiente página
- **WHEN** hay más de 20 candidatos con los filtros activos y el staff avanza de página
- **THEN** el listado muestra los siguientes 20 candidatos, conservando los filtros activos en la navegación

### Requirement: Redacción con tono para candidatos de tipo noticia

Al revisar un candidato de tipo `noticia`, `apps/admin` SHALL permitir seleccionar un tono de redacción de un catálogo fijo de 6 opciones (Informativo, Convocatoria, Celebratorio, Urgente/denuncia, Divulgativo, Agradecimiento). Al seleccionar un tono, el sistema SHALL invocar la API de OpenAI para redactar el cuerpo de la noticia en ese tono a partir del resumen del candidato, y SHALL guardar el tono elegido y la redacción resultante en el candidato. Esta selección NO SHALL ocurrir durante la subida del export — solo al interactuar con el candidato individual.

#### Scenario: Redactar en un tono elegido
- **WHEN** el staff abre un candidato de tipo `noticia` y elige el tono "Celebratorio"
- **THEN** el sistema genera y guarda una redacción en tono celebratorio para ese candidato

#### Scenario: Candidatos de otros tipos no ofrecen selección de tono
- **WHEN** el staff abre un candidato de tipo `jornada`, `evento`, `logro` o `aliado`
- **THEN** la interfaz no muestra selector de tono ni opción de redacción con IA

### Requirement: Aprobación asimétrica según tipo de candidato

Al aprobar un candidato de tipo `noticia`, `jornada` o `evento`, el sistema SHALL dirigir al formulario de creación ya existente en el admin (de noticias o jornadas, según corresponda) con los campos disponibles del candidato prellenados, sin escribir directamente en Firestore desde el candidato. Al aprobar un candidato de tipo `logro` o `aliado`, el sistema SHALL generar un fragmento JSON con la forma de un elemento de `content/landing/{logros,aliados}.json`, listo para copiar, sin escribir en el sistema de archivos. En ambos casos, aprobar SHALL marcar el candidato con `estado: "aprobado"`.

#### Scenario: Aprobar una noticia candidata
- **WHEN** el staff aprueba un candidato de tipo `noticia`
- **THEN** se abre el formulario de creación de noticias con título/resumen/cuerpo prellenados desde el candidato, y el candidato queda marcado como `aprobado`

#### Scenario: Aprobar un logro candidato
- **WHEN** el staff aprueba un candidato de tipo `logro`
- **THEN** se muestra un fragmento JSON copiable con la forma de un elemento de `hitos`, y el candidato queda marcado como `aprobado`

### Requirement: Descarte de candidatos

`apps/admin` SHALL permitir descartar un candidato, marcándolo con `estado: "descartado"` sin eliminarlo de Firestore.

#### Scenario: Descartar un candidato irrelevante
- **WHEN** el staff descarta un candidato desde el listado o su detalle
- **THEN** el candidato queda con `estado: "descartado"` y deja de aparecer en el filtro de pendientes

### Requirement: Cambio de estado desde el listado, sin entrar al detalle

Cada fila del listado SHALL ofrecer las mismas acciones de cambio de estado disponibles en la página de detalle, sin requerir navegar a ella: para un candidato `pendiente`, aprobar y descartar; para un candidato `aprobado` o `descartado`, revertir a `pendiente`. Aprobar una noticia/jornada/evento desde el listado SHALL dirigir al formulario de creación prellenado, igual que desde el detalle.

#### Scenario: Aprobar desde el listado
- **WHEN** el staff aprueba un candidato `pendiente` de tipo `logro` directamente desde su fila en el listado
- **THEN** el candidato queda marcado como `aprobado` sin haber salido del listado

#### Scenario: Revertir a pendiente desde el listado
- **WHEN** el staff revierte un candidato `aprobado` o `descartado` directamente desde su fila
- **THEN** el candidato vuelve a `estado: "pendiente"` y puede aprobarse o descartarse de nuevo

### Requirement: Acceso server-only vía Firebase Admin SDK, sin RBAC

Todo el acceso de lectura y escritura a las colecciones `candidatos` y `candidatos_grupos` desde `apps/admin` SHALL ocurrir server-side (Server Actions / Route Handlers) usando el Firebase Admin SDK, tras verificar la sesión del usuario (capability `auth-admin`). Las reglas de Firestore para ambas colecciones SHALL ser `deny-all` para el client SDK. El sistema NO SHALL diferenciar permisos entre usuarios autenticados del panel (sin RBAC, ADR-0029).

#### Scenario: Escritura requiere sesión válida
- **WHEN** un Server Action o Route Handler de candidatos se invoca sin una sesión `__session` válida
- **THEN** la operación se rechaza (el gate de `(authed)/layout.tsx` ya impide llegar a la página sin sesión)

### Requirement: Secreto OPENAI_API_KEY inyectado en runtime, no versionado

El sistema SHALL leer la credencial de OpenAI desde la variable de entorno `OPENAI_API_KEY`, inyectada en el servicio Cloud Run de `admin` en runtime. Este valor NO SHALL commitearse al repositorio ni aparecer en ningún archivo `.env.production` versionado.

#### Scenario: Falta la credencial
- **WHEN** `OPENAI_API_KEY` no está configurada en el entorno
- **THEN** cualquier intento de invocar la IA (extracción o redacción) falla de forma explícita, sin exponer el error como si fuera un problema del archivo subido
