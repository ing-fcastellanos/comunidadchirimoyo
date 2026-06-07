# ADR-0012 — Privacidad de los datos de voluntarios

- **Estado:** Accepted
- **Fecha:** 2026-06-07
- **Decisores:** @ing-fcastellanos
- **Issue:** _kickoff_

## Contexto

La inscripción de voluntarios captura datos personales (nombre, contacto, jornada elegida, posiblemente acompañantes). En México aplica la **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)**. Como el proyecto eligió manejar estos datos en su propia infraestructura (ADR-0006), asume la responsabilidad de protegerlos.

## Decisión

1. **Minimización:** se capturan solo los datos estrictamente necesarios para organizar la jornada (nombre, un medio de contacto, jornada, # de acompañantes). Nada más.
2. **Consentimiento + aviso de privacidad:** el formulario incluye un aviso de privacidad y casilla de consentimiento explícito antes de enviar.
3. **Almacenamiento restringido:** los datos viven en Firestore con reglas de acceso restringido. **PII nunca se loguea.**
4. **Retención:** los datos se conservan solo mientras sean útiles para la organización de jornadas; se define una política de borrado/retención en la implementación de Fase 4.
5. **Acceso:** solo el equipo organizador accede a las inscripciones.

## Alternativas consideradas

- **No formalizar privacidad (capturar y ya):** riesgo legal y ético inaceptable para datos personales.
- **Delegar a Google Forms:** evitaría parte de la responsabilidad técnica, pero ya se descartó por soberanía de datos (ADR-0006) y tampoco exime del aviso de privacidad.

## Consecuencias

### Positivas

- Cumplimiento con la LFPDPPP y confianza de los voluntarios.
- Superficie de datos personales mínima.

### Negativas

- Trabajo extra: redactar aviso de privacidad, implementar consentimiento, reglas de Firestore y política de retención.

### Neutras

- El texto del aviso de privacidad vive en `content/` y se versiona.

## Plan de revisión

Revisar si cambian los datos capturados, si se añaden cuentas de voluntarios, o si cambia la legislación aplicable.

## Referencias

- ADR-0006 (API mínima), SECURITY.md. ROADMAP Fase 4.
