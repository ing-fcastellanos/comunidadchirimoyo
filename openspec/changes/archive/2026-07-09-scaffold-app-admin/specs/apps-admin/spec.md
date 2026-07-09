## ADDED Requirements

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

### Requirement: Route group de autenticación (stub)

`apps/admin` SHALL declarar un route group `app/(authed)/` con un `layout.tsx` que por ahora **no** realiza ningún chequeo de sesión (renderiza `children` sin gate), estableciendo la estructura de rutas que usarán las páginas protegidas del panel sin necesidad de reestructurarse cuando se implemente el login.

#### Scenario: El route group existe sin lógica de auth
- **WHEN** se inspecciona `apps/admin/app/(authed)/layout.tsx`
- **THEN** el archivo existe y renderiza sus `children` sin redirigir ni verificar sesión

### Requirement: Configuración de Firebase Web SDK documentada (sin implementar)

`apps/admin/.env.example` SHALL documentar las variables públicas del Web SDK de Firebase (`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, y las demás requeridas por la inicialización estándar), sin que el scaffold instale el paquete `firebase` ni inicialice ningún cliente.

#### Scenario: Variables documentadas, sin dependencia de auth
- **WHEN** se revisa `apps/admin/.env.example` y `apps/admin/package.json`
- **THEN** las variables `NEXT_PUBLIC_FIREBASE_*` están documentadas, y el paquete `firebase` NO aparece en las dependencias

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
