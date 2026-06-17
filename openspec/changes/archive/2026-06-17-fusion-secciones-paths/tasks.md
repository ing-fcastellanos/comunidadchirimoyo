## 1. apps/sitio — enlaces a rutas relativas

- [x] 1.1 `apps/sitio/lib/links.ts`: `COMUNIDAD_URL = "/comunidad"`, `VOLUNTARIOS_URL = "/voluntarios"`; `AVES_URL` queda absoluto. Actualizar el comentario de cabecera (ya no "subdominios").
- [x] 1.2 Verificar que `Header.tsx`, `CierreCTA.tsx` y `Hero.tsx` siguen usando `<a href={...}>` (sin migrar a `<Link>`) y que el href resuelve correcto con la ruta relativa.
- [x] 1.3 Actualizar el comentario de `Header.tsx` que cita "URLs absolutas de subdominio (ADR-0008)" → reflejar paths relativos + aves absoluta (ADR-0023).

## 2. apps/sitio — eliminar ruteo por host

- [x] 2.1 Borrar `apps/sitio/middleware.ts` (queda sin lógica al quitar el rewrite por host).
- [x] 2.2 Confirmar que `next.config.ts` y el resto de la app no dependen del middleware eliminado.

## 3. apps/catalogo — comunidad vía vanity

- [x] 3.1 `apps/catalogo/lib/links.ts`: mantener `COMUNIDAD_URL` **absoluto** apuntando al vanity `https://comunidad.chirimoyo.org` (no relativo: otro origen). Ajustar comentario explicando el porqué.
- [x] 3.2 Verificar que `Hero.tsx`, `ElHumedal.tsx` y `not-found.tsx` del catálogo siguen funcionando con el destino del vanity.

## 4. Contenido

- [x] 4.1 `content/landing/enlaces.json`: `sitios[]` de `comunidad` → `"/comunidad"` y `voluntarios` → `"/voluntarios"`; `aves` sin cambio.
- [x] 4.2 Confirmar que el Footer (Server Component que deriva de `enlaces.json`) renderiza los enlaces de sección como rutas relativas.

## 5. Configuración

- [x] 5.1 `apps/sitio/.env.example`: en `NEXT_PUBLIC_CF_BEACON_TOKENS` retirar las claves `comunidad.chirimoyo.org` y `voluntarios.chirimoyo.org` (solo redirigen, no renderizan); dejar `chirimoyo.org`. Ajustar el comentario ("sirve tres dominios" → uno).

## 6. Redirect vanity (documentación, no infra)

- [x] 6.1 Documentar en el runbook/README el redirect **301**: `comunidad.chirimoyo.org/*` → `chirimoyo.org/comunidad/*` y `voluntarios.chirimoyo.org/*` → `chirimoyo.org/voluntarios/*`, preservando subpath. Indicar que la configuración real de DNS/Hosting la ejecuta #53.

## 7. Specs y documentación

- [x] 7.1 Aplicar el delta de la spec `sitio-app` al archivar (lo gestiona `/opsx:archive`): ruteo por paths, Header con Comunidad/Voluntarios relativas + Aves absoluta, justificación de `output: standalone` por Server Actions.
- [x] 7.2 `CLAUDE.md`: descripción de `apps/sitio` → paths bajo `chirimoyo.org` + vanity (no subdominios dedicados).
- [x] 7.3 `README.md`: tabla de dominios → `chirimoyo.org/comunidad` y `/voluntarios` (vanity 301 como nota).
- [x] 7.4 `docs/architecture/overview.md`: "Sirve tres subdominios" → un dominio con paths + vanity redirects.

## 8. Verificación

- [x] 8.1 `apps/sitio`: `npm run build` ok; navegar `/`, `/comunidad`, `/voluntarios` sin middleware; enlaces internos relativos y sin URLs absolutas cross-sección (salvo aves).
- [x] 8.2 `apps/catalogo`: `npm run build` ok; enlaces a la comunidad apuntan al vanity absoluto.
- [x] 8.3 `openspec validate fusion-secciones-paths` pasa.
