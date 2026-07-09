## RENAMED Requirements

- FROM: `### Requirement: Route group de autenticación (stub)`
- TO: `### Requirement: Route group de autenticación`

- FROM: `### Requirement: Configuración de Firebase Web SDK documentada (sin implementar)`
- TO: `### Requirement: Configuración e inicialización del Firebase Web SDK`

## MODIFIED Requirements

### Requirement: Route group de autenticación

`apps/admin` SHALL declarar un route group `app/(authed)/` cuyo `layout.tsx` verifica la sesión del usuario (ver capability `auth-admin`) antes de renderizar cualquier página protegida, redirigiendo a `/login` cuando no hay sesión válida. El route group SHALL contener al menos una página de prueba (`app/(authed)/page.tsx`) que confirme la sesión activa y ofrezca cerrar sesión, hasta que sea reemplazada por el dashboard real del panel.

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
