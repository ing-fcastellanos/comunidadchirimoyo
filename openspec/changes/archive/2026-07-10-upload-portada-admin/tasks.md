## 1. Cliente GCS y dependencia

- [x] 1.1 Agregar `@google-cloud/storage` como dependencia directa de `apps/admin/package.json`
- [x] 1.2 Crear `apps/admin/lib/storage.ts` (cliente GCS lazy-singleton vía ADC, espejo de `lib/firestore.ts`/`lib/firebase-admin.ts`, cacheado en `globalThis`)

## 2. Validación y subida

- [x] 2.1 Crear `apps/admin/lib/portada/validation.ts` (content-type restringido a jpeg/png/webp, tamaño máximo 5MB, mapeo content-type→extensión)
- [x] 2.2 Crear `apps/admin/lib/portada/subir.ts` con la función que sube el buffer a `noticias/{slug}-portada.<ext>` (sobreescribe si ya existe)

## 3. Route Handler

- [x] 3.1 Crear `apps/admin/app/api/noticias/[slug]/portada/route.ts` (POST): verifica sesión (`getSession`), lee el archivo del `multipart/form-data`, valida (2.1), sube (2.2), responde `{ path }` o error
- [x] 3.2 Verificar que la noticia con ese `slug` existe antes de subir (404 si no, evita huérfanos atados a slugs inexistentes)

## 4. Diseño visual (Claude Design, antes de codear)

- [x] 4.1 Construir mockup del widget de upload (selector de archivo, vista previa de la imagen actual, botón "Reemplazar imagen", estados de progreso/error)
- [x] 4.2 Revisar el mockup con el usuario antes de traducir a código — aprobado sin cambios funcionales (solo un ajuste de dependencia de `useLucide` para la maqueta, irrelevante para el código real)

## 5. UI en apps/admin

- [x] 5.1 Crear componente `apps/admin/components/noticias/PortadaUpload.tsx` (client component: input file, preview con `next/image`, llama al Route Handler, actualiza el campo `portada` del formulario al terminar)
- [x] 5.2 Reemplazar el input de texto plano de `portada` en `NoticiaFormulario.tsx` por `PortadaUpload`, **solo cuando `modo === "editar"`** (D6); `portadaAlt` se mantiene como campo de texto
- [x] 5.3 Agregar `next.config.ts` remotePatterns ya cubre `storage.googleapis.com/comunidad-chirimoyo/**` (verificar, ya existe desde #140 — no debería requerir cambios) — confirmado, sin cambios necesarios

## 6. IAM y documentación

- [ ] 6.1 Otorgar `roles/storage.objectAdmin` sobre el bucket `comunidad-chirimoyo` al service account runtime de Cloud Run `admin` (paso de infra manual, fuera de este código — pendiente de que el usuario lo ejecute en GCP antes de desplegar a producción; documentado en 6.2 y anotado para el runbook #144)
- [x] 6.2 Documentar el rol nuevo en `apps/admin/README.md` (junto a `serviceAccountTokenCreator` de #139 y `datastore.user` de #140/#141) y anotar para el runbook #144

## 7. Verificación end-to-end

- [x] 7.1 Con emulator de Firestore/Auth corriendo, el usuario confirmó probar contra el bucket **real** `comunidad-chirimoyo` (gcloud ADC, proyecto `chirimoyo`, con un slug de prueba obvio y limpieza posterior): creada la noticia de prueba, subida una imagen PNG válida (generada en canvas) — el objeto apareció en `gs://comunidad-chirimoyo/noticias/{slug}-portada.png` exactamente como se esperaba
- [x] 7.2 Guardado el formulario, recarga completa de la página confirmó que `portada`/`portadaAlt` persistieron correctamente en Firestore (round-trip real, no solo estado optimista de UI)
- [x] 7.3 Probado el rechazo: archivo `.txt` → "Formato no soportado. Usa JPEG, PNG o WebP."; archivo de 6MB → "La imagen no puede pesar más de 5MB." — ninguno llegó a subirse
- [x] 7.4 Re-subida de una segunda imagen para la misma noticia — confirmado con `gcloud storage objects describe` que el `updateTime` del mismo objeto cambió (sobreescritura in-place, sin duplicados, confirmado también con `gcloud storage ls`)
- [x] 7.5 Noticia publicada y verificada en `apps/sitio`: la portada se sirvió correctamente vía `next/image` desde el bucket real (`GET /_next/image?url=...storage.googleapis.com...noticias%2F{slug}-portada.png → 200 OK`)
- [x] 7.6 `npm run typecheck && npm run lint && npm run build` en `apps/admin` — limpios; la ruta `/api/noticias/[slug]/portada` es dinámica

**Limpieza post-prueba:** objeto de prueba borrado del bucket real (`gcloud storage rm`, confirmado con `gcloud storage ls` que ya no existe); la noticia de prueba solo vivió en el emulator de Firestore (efímero, sin rastro en producción).

## 8. OpenSpec y PR

- [ ] 8.1 `/opsx:archive` del cambio `upload-portada-admin`, sincronizando `openspec/specs/upload-portada-admin/spec.md`
- [ ] 8.2 Commit en branch `feature/fase6-upload-portada-admin` y PR contra `main` (usar `Closes #142` en inglés en la descripción)
