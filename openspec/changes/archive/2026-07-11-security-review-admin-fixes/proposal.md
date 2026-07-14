## Why

El issue #143 pide una revisión de seguridad del panel admin antes de exponerlo (ADR-0029/ADR-0030). La revisión manual de todo `apps/admin` (scaffold #138 → subida de portadas #142, ya mergeado como #155) confirmó que los tres puntos explícitos del checklist están correctos (manejo de sesión/tokens, reglas Firestore `deny-all` intactas, CORS/service account), pero encontró dos huecos puntuales que vale la pena cerrar antes de dar por cerrado el issue.

## What Changes

- **`apps/admin/app/api/auth/session/route.ts`**: el `redirectTo` que el cliente puede enviar en el POST de login se valida ahora como ruta relativa del mismo origen (empieza con `/`, no con `//` ni `/\`) antes de devolverlo — cierra un *open redirect* latente (hoy sin caller real, pero explotable en cuanto alguien agregue un "volver a X tras login").
- **`apps/admin/lib/portada/validation.ts`**: además de validar el `content-type` declarado y el tamaño, se verifica la **firma binaria real** (magic bytes) del archivo antes de subirlo — el `content-type` que declara el cliente es trivialmente falsificable (demostrado en la verificación e2e de #142), así que ya no basta con confiar en él.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `auth-admin`: se agrega un requisito nuevo sobre validar que `redirectTo` sea una ruta relativa segura antes de usarla para navegar tras el login (no contradice ningún requisito existente, es una preocupación no cubierta hasta ahora).
- `upload-portada-admin`: se extiende el requisito existente "Validación del archivo antes de subir" para exigir también la verificación de la firma binaria real (PNG/JPEG/WebP), no solo el `content-type` declarado.

## Impact

- **Código modificado:** `apps/admin/app/api/auth/session/route.ts` (función de validación de ruta), `apps/admin/lib/portada/validation.ts` (verificación de magic bytes sobre el buffer ya cargado en memoria).
- **Dependencias:** ninguna nueva (lectura de bytes a mano, sin librería de procesamiento de imágenes — ADR de #142 D4 sigue vigente).
- **Sin cambios:** reglas Firestore (`deny-all` ya confirmado intacto), CORS (ya confirmado sin headers, correcto por diseño), RBAC (ADR-0029, un solo rol), rate-limiting (fuera de alcance, volumen bajo/usuarios de confianza), headers de seguridad tipo CSP/X-Frame-Options (gap de las 3 apps del monorepo, no introducido por Fase 6, fuera de alcance de este fix puntual).
- **Subdominios afectados:** admin (los dos fixes viven exclusivamente ahí).
