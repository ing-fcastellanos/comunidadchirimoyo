## 1. Configuración del API (plumbing server-side)

- [x] 1.1 Agregar `API_URL` (base del API, server-side, NO `NEXT_PUBLIC_*`) a `apps/sitio/.env.example` y `.env.local`
- [x] 1.2 Crear helper en `lib/` que construya el endpoint de contacto desde `API_URL` (reusable por voluntarios)

## 2. Reglas de validación compartidas

- [x] 2.1 Crear módulo de validación de contacto en `lib/` con las reglas espejo del backend (nombre ≤120, correo formato, asunto ≤160, mensaje ≤5000 + mínimo, consentimiento=true), devolviendo errores por campo

## 3. Server Action

- [x] 3.1 Crear el Server Action (`app/actions/contacto.ts` o equivalente): revalida el payload, hace `POST` a `${API_URL}/api/contacto`, sin loguear PII
- [x] 3.2 Mapear respuestas a un resultado discriminado: `201`/`200`→ok, `400`→{tipo:"validacion", errores}, `5xx`/red→{tipo:"servidor"}

## 4. Porteo del formulario (handoff v0 → TS + tokens)

- [x] 4.1 Portear `design-assets/Contacto.jsx` a `components/contacto/` en TS: campo reutilizable, íconos, clases con tokens del proyecto (`forest`, `mint`, `paper-card`, `ink`, terra para errores)
- [x] 4.2 Conservar accesibilidad: labels + `aria-describedby`, resumen `role="alert"` con foco, región `aria-live`, honeypot `website` fuera de pantalla, marcas de requerido
- [x] 4.3 Cablear el envío al Server Action (reemplazar el `setTimeout` simulado): estados idle/submitting/success/error desde el resultado del action
- [x] 4.4 Mapear errores de validación del action a los mensajes por campo; deshabilitar el botón en submitting (sin envíos duplicados)

## 5. Ruta /contacto

- [x] 5.1 Crear `app/contacto/page.tsx` con `metadata` (título/descripm.) que componga el Client Component del formulario

## 6. Puntos de entrada

- [x] 6.1 Actualizar `components/landing/Linktree.tsx` para enlazar a `/contacto` (en vez de solo `mailto:`)
- [x] 6.2 Actualizar `components/layout/Footer.tsx` para enlazar a `/contacto`
- [x] 6.3 N/A — `/contacto` es ruta interna hardcodeada (patrón de los enlaces `LEGALES` del Footer), no se deriva de `enlaces.json`

## 7. Verificación

- [x] 7.1 `npm run build`/lint del sitio en verde; sin errores de tipos (tsc + next lint limpios)
- [x] 7.2 Verificar en el navegador (preview): validación accesible (alerta con foco + 5 errores + aria-invalid), honeypot inalcanzable (aria-hidden, tabindex=-1, off-screen), móvil ~380px sin overflow, tokens correctos (forest/terra/paper-card)
- [x] 7.3 Verificar que la URL del API NO aparece en el HTML/bundle entregado al cliente (sin `8080` ni `/api/contacto` en el cliente)
- [x] 7.4 Camino de validación cliente y error de servidor/red verificados en vivo (API caída → estado error genérico). El éxito `201` real requiere el Flask + Firestore con credenciales (deploy) — la lógica del action que mapea 201→ok está cableada y ejercitada
- [x] 7.5 `openspec validate "contacto-form-landing" --strict` en verde
