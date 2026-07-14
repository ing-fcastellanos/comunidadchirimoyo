## 1. Fix: redirectTo seguro en el login

- [x] 1.1 Agregar `rutaSegura(valor)` en `apps/admin/app/api/auth/session/route.ts` (acepta solo rutas que empiecen con un solo `/`, rechaza `//` y `/\`, default `/dashboard`)
- [x] 1.2 Aplicar `rutaSegura()` sobre `body.redirectTo` antes de incluirlo en la respuesta JSON

## 2. Fix: verificación de magic bytes en portada

- [x] 2.1 Agregar función de verificación de firma binaria en `apps/admin/lib/portada/validation.ts` (PNG/JPEG/WebP, sin nueva dependencia)
- [x] 2.2 Integrar la verificación en `validarArchivoPortada` (o una función complementaria llamada después de leer el buffer), antes de llamar a `subirPortada` en el Route Handler
- [x] 2.3 Actualizar el mensaje de error para el caso de firma no coincidente (distinto del mensaje de "formato no soportado")

## 3. Verificación

- [x] 3.1 `npm run typecheck && npm run lint && npm run build` en `apps/admin` — limpios
- [x] 3.2 Probado directamente contra el endpoint (`curl` con idToken real del emulator): sin `redirectTo` → `/dashboard`; `redirectTo: "/noticias"` (válido) → aceptado tal cual; `redirectTo: "//evil.com"` → ignorado, cae a `/dashboard`; `redirectTo: "/\\evil.com"` → ignorado, cae a `/dashboard`
- [x] 3.3 Probado con un `Blob` de texto plano declarado `type: "image/png"` (mismo truco de la verificación e2e de #142) — rechazado con `400` y el mensaje nuevo `"El archivo no parece ser una imagen válida."` (confirmado en la respuesta HTTP y en la UI), sin escribir nada al bucket
- [x] 3.4 Confirmada una subida real de imagen válida (PNG genuino generado en canvas) contra el bucket real `comunidad-chirimoyo` — objeto creado con el path esperado, sin regresión en el camino positivo

**Limpieza post-prueba:** objeto de prueba borrado del bucket real (`gcloud storage rm`, confirmado con `gcloud storage ls` que ya no existe); la noticia de prueba solo vivió en el emulator de Firestore (efímera, sin rastro en producción).

## 4. OpenSpec y PR

- [ ] 4.1 `/opsx:archive` del cambio `security-review-admin-fixes`, sincronizando `openspec/specs/auth-admin/spec.md` y `openspec/specs/upload-portada-admin/spec.md`
- [ ] 4.2 Commit en branch `feature/fase6-security-review-admin-fixes` y PR contra `main` (usar `Closes #143` en inglés en la descripción)
