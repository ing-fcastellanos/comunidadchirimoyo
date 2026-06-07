# ADR-0006 — API mínima: inscripciones de voluntarios + contacto

- **Estado:** Accepted
- **Fecha:** 2026-06-07
- **Decisores:** @ing-fcastellanos
- **Issue:** _kickoff_

## Contexto

Casi todo el proyecto es contenido estático. Los únicos flujos que requieren cómputo de servidor y persistencia son: **inscripción de voluntarios** a jornadas y **formulario de contacto**. Hay que decidir el alcance del backend y dónde se guardan los datos.

## Decisión

`services/api` (Flask + Firestore) tiene un alcance **mínimo y acotado**:

1. **Inscripciones de voluntarios:** recibe el formulario, valida, persiste en Firestore y dispara email de confirmación (SMTP).
2. **Contacto:** recibe mensajes y los persiste / reenvía por email.

**No** incluye: autenticación de usuarios, RBAC, pagos, generación de contenido, ni búsqueda del catálogo. Cualquiera de esas responsabilidades requiere un ADR nuevo.

Se conserva un API propio (en vez de Google Forms / Formspree) para **soberanía de los datos** de quienes apoyan la causa.

## Alternativas consideradas

- **Sin backend, formularios vía servicio externo (Google Forms/Formspree):** cero código, pero los datos personales de voluntarios viven en un tercero y se rompe la identidad del sitio. Descartada por soberanía de datos.
- **Backend completo estilo Sociedad Salvaje (auth, RBAC, pagos):** desproporcionado; no hay cuentas de usuario ni pagos en línea (ver ADR-0007).
- **Funciones serverless (Cloud Functions) en vez de un servicio Flask:** más barato para tráfico bajo, pero rompe homogeneidad con el stack heredado (ADR-0002). Anotado como posible optimización futura.

## Consecuencias

### Positivas

- Los datos de voluntarios son propios y controlados.
- Superficie de ataque y mantenimiento mínimos.
- Encaja con el stack y deploy ya conocidos.

### Negativas

- Un servicio Cloud Run casi inactivo tiene un costo base pequeño (mitigable con escalado a cero).

### Neutras

- El comportamiento del API se documenta en specs OpenSpec (`openspec/specs/`).

## Plan de revisión

Reconsiderar pasar a serverless si el costo de un Cloud Run idle no se justifica. Reabrir alcance solo vía ADR si aparece una necesidad real (p. ej. cuentas de voluntarios recurrentes).

## Referencias

- ADR-0002 (stack), ADR-0007 (donaciones), ADR-0012 (privacidad de datos).
