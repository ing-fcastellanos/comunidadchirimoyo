# Política de seguridad

## Reportar una vulnerabilidad

Si encuentras una vulnerabilidad de seguridad **no abras una issue pública**. Escríbenos al correo de seguridad del proyecto con:

- Descripción de la vulnerabilidad.
- Pasos para reproducirla.
- Impacto potencial.

Responderemos lo antes posible y te mantendremos al tanto de la corrección.

## Alcance

Nos interesan especialmente reportes sobre:

- Exposición de datos personales de voluntarios (formularios de inscripción).
- Fugas de secretos o credenciales.
- Vulnerabilidades en el endpoint público del API (`api.chirimoyo.org`).

## Datos sensibles

Los datos personales de voluntarios se almacenan en Firestore con acceso restringido. Nunca se loguean datos personales ni secretos. Ver [ADR-0012](docs/decisions/0012-privacidad-datos-voluntarios.md).
