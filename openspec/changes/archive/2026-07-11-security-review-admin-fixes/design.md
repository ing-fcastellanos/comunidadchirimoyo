## Context

Issue #143 pidió una revisión de seguridad de todo `apps/admin` antes de "exponerlo" (ADR-0029/ADR-0030). La revisión cubrió el rango completo desde el scaffold (#138, commit `b22b692`) hasta la subida de portadas (#142/#155, ya mergeado). Los tres puntos explícitos del checklist del issue se verificaron directamente contra el código y están correctos:

- **Auth/sesión:** `session/route.ts` verifica el `idToken` antes de crear la cookie, cookie `httpOnly`+`secure` en prod+`sameSite=lax`, `checkRevoked:true` en cada verificación, logout revoca refresh tokens.
- **Firestore `deny-all`:** `services/api/firestore.rules` sigue con `allow read, write: if false` global, sin excepciones agregadas por ningún PR de Fase 6.
- **CORS/service account:** ningún header `Access-Control-*` configurado en `apps/admin` (same-origin por diseño); todos los clientes (`firestore.ts`, `firebase-admin.ts`, `storage.ts`) usan ADC, sin llaves JSON.

Durante la revisión más a fondo aparecieron dos huecos puntuales (no parte del checklist original, pero dentro del espíritu de "revisión de seguridad"), que este cambio cierra.

## Goals / Non-Goals

**Goals:**
- Cerrar el open redirect latente en el endpoint de sesión.
- Cerrar la confianza ciega en el `content-type` declarado al subir una portada, verificando la firma binaria real.

**Non-Goals:**
- Headers de seguridad (CSP, `X-Frame-Options`, etc.) — gap de las 3 apps del monorepo, no introducido por Fase 6; se deja fuera de este fix puntual (podría ser un cambio propio más adelante si se decide abordarlo).
- Rate-limiting de login/upload — aceptado dado el volumen bajo y el modelo de amenaza de ADR-0029 (1-2 editores de confianza).
- RBAC — explícitamente fuera de alcance por ADR-0029.
- Procesamiento/optimización de imágenes — la verificación de magic bytes es validación de forma, no reemplaza ni contradice la decisión de #142 (D4) de no re-codificar/optimizar.

## Decisions

### D1 — `redirectTo` restringido a rutas relativas del mismo origen

`session/route.ts` agrega una función `rutaSegura(valor: string | undefined): string` que:
- Devuelve `/dashboard` si `valor` es `undefined`, vacío, o no empieza exactamente con un solo `/` (rechaza `//evil.com`, `/\evil.com`, o cualquier string que no empiece con `/`).
- Devuelve `valor` tal cual si pasa la validación.

Se aplica sobre `body.redirectTo` antes de incluirlo en la respuesta JSON. No cambia el comportamiento actual (ningún caller envía `redirectTo` hoy) — es defensa en profundidad para cuando se agregue un flujo de "volver a X tras iniciar sesión".

**Alternativa descartada:** quitar el parámetro `redirectTo` por completo (ya que nadie lo usa). Rechazada: el issue original de login (#139) lo diseñó como extensión punto explícita; quitarlo solo pospone el mismo trabajo de validación a cuando se implemente el uso real, con más riesgo de que se agregue sin la validación correspondiente.

### D2 — Verificación de magic bytes antes de subir la portada

`apps/admin/lib/portada/validation.ts` agrega una segunda fase de validación, después de la ya existente (content-type declarado + tamaño): lee los primeros bytes del `Buffer` (ya cargado en memoria en el Route Handler antes de llamar a `subirPortada`) y confirma que la firma binaria coincide con el `content-type` declarado:

| Content-type declarado | Firma esperada (primeros bytes) |
|---|---|
| `image/png` | `89 50 4E 47` |
| `image/jpeg` | `FF D8 FF` |
| `image/webp` | bytes 0-3 = `"RIFF"`, bytes 8-11 = `"WEBP"` |

Si la firma no coincide, la subida se rechaza **antes** de tocar el bucket (mismo criterio que los demás rechazos: `content-type` no soportado, tamaño excedido).

**Alternativa descartada:** usar una librería de detección de tipo de archivo (`file-type` u otra). Rechazada: la lógica de firma para exactamente 3 formatos es ~15 líneas sin dependencias; agregar una librería para esto sería desproporcionado (mismo criterio que #142 D4 de no agregar `sharp`).

## Risks / Trade-offs

- **[Riesgo] Firmas de magic bytes incompletas o con falsos negativos en variantes poco comunes de WebP** (ej. WebP animado con extensiones de formato menos frecuentes) → Mitigación: los 3 formatos aceptados son ampliamente estandarizados y sus firmas base (no las extensiones) son estables; si aparece un falso rechazo real, se ajusta la firma entonces, no es un caso ambiguo hoy.
- **[Trade-off] La verificación de magic bytes no es una garantía de que el archivo sea 100% válido/no esté corrupto** — solo confirma que los primeros bytes coinciden con el formato declarado, no valida la estructura completa. Aceptado: es una mejora significativa sobre "cero verificación", sin la complejidad de un decodificador de imágenes completo.
- **[Riesgo] `redirectTo` sigue sin usarse en la práctica** — el fix es preventivo, no corrige un bug activo. Aceptado como defensa en profundidad de bajo costo.

## Migration Plan

Sin migración de datos ni cambios de infraestructura. Ambos fixes son cambios de código puro en `apps/admin`, deployables con el flujo normal (`npm run deploy_prod`). Verificación: repetir los casos de prueba de #142 (subida válida, tipo no soportado, tamaño excedido) más un caso nuevo (content-type declarado que no coincide con los bytes reales, ej. un `.txt` renombrado a `.png` con `type: "image/png"`), y confirmar que el login sigue funcionando igual con y sin `redirectTo` en el body.

## Open Questions

Ninguna pendiente — ambas decisiones (D1, D2) fueron cerradas explícitamente por el usuario en `/opsx:explore 143` (opción B para D2, confirmada directamente).
