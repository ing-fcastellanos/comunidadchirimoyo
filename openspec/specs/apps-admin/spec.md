# apps-admin Specification

## Purpose
TBD - created by archiving change scaffold-app-admin. Update Purpose after archive.
## Requirements
### Requirement: Scaffold de `apps/admin`

El repositorio SHALL contener una app **`apps/admin`** (Next 15, App Router) construible y desplegable de forma **independiente** (ADR-0001, sin tooling de workspace), siguiendo las mismas convenciones de configuración que `apps/sitio` (`tsconfig.json` con alias `@/*`, ESLint `next/core-web-vitals` + `next/typescript`, PostCSS con Tailwind v4, `components.json` de shadcn estilo `new-york`). La app SHALL usar `output: "standalone"` para correr en Cloud Run.

#### Scenario: La app compila y tipa de forma independiente
- **WHEN** se ejecuta `npm install && npm run build && npm run typecheck` dentro de `apps/admin`
- **THEN** el build y el typecheck completan sin errores, sin depender de ninguna otra app del monorepo

### Requirement: Tokens de diseño compartidos por copia

`apps/admin` SHALL reusar el sistema de diseño canónico (ADR-0013) mediante `apps/admin/app/tokens.css`, sincronizado por `scripts/sync-design-tokens.mjs` igual que `sitio` y `catalogo`, sin requerir cambios en ese script.

#### Scenario: Sincronización de tokens incluye admin
- **WHEN** se ejecuta `node scripts/sync-design-tokens.mjs` desde la raíz del repo
- **THEN** `apps/admin/app/tokens.css` se actualiza con el contenido canónico, igual que las demás apps

### Requirement: Route group de autenticación

`apps/admin` SHALL declarar un route group `app/(authed)/` cuyo `layout.tsx` verifica la sesión del usuario (ver capability `auth-admin`) antes de renderizar cualquier página protegida, redirigiendo a `/login` cuando no hay sesión válida. El route group SHALL contener al menos una página de prueba (`app/(authed)/dashboard/page.tsx`) que confirme la sesión activa y ofrezca cerrar sesión, hasta que sea reemplazada por el dashboard real del panel.

#### Scenario: El route group gatea sus páginas
- **WHEN** se inspecciona `apps/admin/app/(authed)/layout.tsx`
- **THEN** el archivo verifica la sesión server-side y redirige a `/login` si no es válida

#### Scenario: Página de prueba disponible
- **WHEN** se accede a `(authed)/` con una sesión válida
- **THEN** se muestra una página que confirma la sesión activa y permite cerrar sesión

### Requirement: Configuración e inicialización del Firebase Web SDK

`apps/admin` SHALL inicializar el Web SDK de Firebase (`firebase`, paquete de cliente) usando las variables `NEXT_PUBLIC_FIREBASE_*` documentadas en `.env.example`, para el flujo de login (capability `auth-admin`). El paquete `firebase` SHALL aparecer en las dependencias de `apps/admin/package.json`.

#### Scenario: SDK inicializado con las variables documentadas
- **WHEN** se revisa `apps/admin/lib/firebase-client.ts`
- **THEN** inicializa el Web SDK de Firebase leyendo las variables `NEXT_PUBLIC_FIREBASE_*`

#### Scenario: Dependencia presente
- **WHEN** se revisa `apps/admin/package.json`
- **THEN** el paquete `firebase` aparece en las dependencias

### Requirement: Despliegue en `admin.chirimoyo.org`

`apps/admin` SHALL desplegarse en el subdominio **`admin.chirimoyo.org`** mediante un rewrite de Firebase Hosting (apuntando al site **ya existente** `admin-chirimoyo`, referenciado por `target` en `.firebaserc`) hacia un servicio Cloud Run llamado `admin` en la región **`us-central1`** (ADR-0015: Firebase Hosting rewrites a Cloud Run no soporta `northamerica-south1`). `apps/admin/package.json` SHALL incluir los scripts de build/push/deploy necesarios para ejecutar ese despliegue.

#### Scenario: firebase.json referencia el site y la región correctos
- **WHEN** se inspecciona `apps/admin/firebase.json` y `apps/admin/.firebaserc`
- **THEN** el rewrite apunta a un servicio Cloud Run `admin` en `us-central1`, y el target de Hosting referencia el site `admin-chirimoyo`

### Requirement: CI de la app admin

El workflow `ci-frontend.yml` SHALL incluir `admin` en su matriz de apps, de modo que sus PRs corran lint y typecheck automáticamente igual que `sitio` y `catalogo`.

#### Scenario: CI corre sobre admin
- **WHEN** se abre un PR que modifica `apps/admin`
- **THEN** el job de CI Frontend ejecuta lint y typecheck para `apps/admin`
