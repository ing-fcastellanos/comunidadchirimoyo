## Why

Buena parte de lo que termina siendo noticia, jornada, logro o proyecto aliado se menciona primero en los grupos de WhatsApp de la comunidad. Hoy ese contenido depende de que alguien lo recuerde y lo redacte a mano — se pierde o llega tarde. Se busca automatizar el descubrimiento: subir un export manual de un chat, dejar que una IA extraiga y clasifique candidatos, y revisarlos desde `apps/admin`.

## What Changes

- Nueva sección en `apps/admin` (`/candidatos`) para subir exports de chat de WhatsApp y revisar los candidatos que la IA extrae de ellos.
- Ingesta manual (Opción C): el staff exporta el chat desde WhatsApp (función nativa "Exportar chat", sin medios) y lo sube como `.txt` al admin. No se automatiza WhatsApp en sí.
- El admin distingue la fuente: cada export se etiqueta con uno de los 3 grupos de WhatsApp de la comunidad configurados de antemano.
- Deduplicación por grupo: se guarda la fecha del último mensaje ya analizado, por grupo. Cada subida solo envía a la IA los mensajes posteriores a ese corte; si no hay mensajes nuevos, no se llama a la IA.
- El archivo de chat crudo se descarta tras el procesamiento — nunca se almacena (ni en Firestore ni en Storage). Solo persisten los candidatos ya extraídos (resumen, no el texto completo de terceros).
- Clasificación de cada candidato en uno de 5 tipos sugeridos por la IA: noticia, jornada, evento, logro, aliado.
- Flujo en dos fases: (1) al subir un export, extracción/clasificación en lote vía OpenAI; (2) al revisar un candidato de tipo noticia, selección de un tono de redacción (de un catálogo fijo de 6) que dispara una segunda llamada a OpenAI para redactar el cuerpo.
- Al aprobar un candidato: noticia/jornada/evento pre-llenan el formulario de creación ya existente en el admin; logro/aliado generan un fragmento JSON listo para copiar a `content/landing/{logros,aliados}.json` (sin CRUD nuevo para estos dos, ADR-0004).
- Nueva colección Firestore `candidatos` + estado de corte por grupo, con reglas `deny-all` para el client SDK (mismo patrón que noticias/jornadas).
- Nuevo secreto `OPENAI_API_KEY` inyectado como variable de entorno en el Cloud Run de `apps/admin` (mismo patrón que `MAIL_PASSWORD`).

## Capabilities

### New Capabilities
- `candidatos-admin`: subida de exports de WhatsApp, extracción/clasificación con IA, listado y revisión de candidatos, redacción con tono para noticias, y aprobación (prellenado de formularios existentes o generación de fragmento JSON) desde `apps/admin`.

### Modified Capabilities
(ninguna — noticias-admin y jornadas-admin no cambian sus requisitos: el prellenado desde un candidato es una entrada adicional a los formularios ya existentes, sin alterar su contrato de creación/validación)

## Impact

- **Afecta**: `apps/admin` (nueva ruta, componentes, server actions, integración OpenAI), Firestore (nueva colección `candidatos` + documento(s) de corte por grupo, nuevas reglas deny-all), Cloud Run de `admin` (nuevo secreto `OPENAI_API_KEY`).
- **No afecta**: `services/api` (sin cambios), `apps/sitio`, `apps/catalogo`, el esquema de `content/landing/{logros,aliados}.json` (se sigue editando a mano, sin CRUD nuevo), Cloud Scheduler (no aplica, el proceso es disparado por el humano al subir un export).
- **Sub-dominios afectados**: admin (foundation de Fase 6), sin impacto en sitio/comunidad/aves/voluntarios/api públicos.
