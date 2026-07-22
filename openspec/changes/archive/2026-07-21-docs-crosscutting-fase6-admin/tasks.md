## 1. CLAUDE.md

- [x] 1.1 Agregar `apps/admin` a la lista de apps en "Identidad del proyecto"
- [x] 1.2 Corregir fila "Contenido" de la tabla de stack (salvedad noticias/jornadas en Firestore, ADR-0028)
- [x] 1.3 Reformular "no hay auth de usuarios" distinguiendo público (sitio/catálogo/api) vs. panel admin (Firebase Auth, ADR-0029)
- [x] 1.4 Agregar el tercer aviso crítico: "Noticias y jornadas viven en Firestore, no en content/" (D1)

## 2. README.md

- [x] 2.1 Agregar fila `admin.chirimoyo.org` a la tabla "Sitios"
- [x] 2.2 Agregar `apps/admin` al árbol de "Estructura"
- [x] 2.3 Agregar Firebase Auth/Admin SDK a la sección "Stack"

## 3. docs/architecture/overview.md

- [x] 3.1 Agregar nodo `apps/admin` al diagrama ASCII, conectado a Firestore
- [x] 3.2 Nueva subsección de boundaries "apps/admin" (Firebase-native, no extiende el API)
- [x] 3.3 Corregir la viñeta de `apps/sitio` sobre noticias/jornadas (Firestore server-side, no `content/` en build)
- [x] 3.4 Agregar noticias/jornadas a la sección "Datos" (Firestore)
- [x] 3.5 Agregar Firebase Auth a "Servicios externos"

## 4. ROADMAP.md

- [x] 4.1 Agregar fila Fase 6 a "Modelo de fases"
- [x] 4.2 Agregar ADR-0027 a ADR-0030 a "Decisiones de arquitectura"

## 5. docs/project-management.md

- [x] 5.1 Corregir "un milestone por fase (Fase 0 a Fase 5)" → "Fase 0 a Fase 6"
- [x] 5.2 Agregar fila Fase 6 a la tabla de "Modelo de fases"
- [x] 5.3 Agregar `subdomain: admin` a la taxonomía de labels
- [x] 5.4 Mencionar `setup-phase6-contenido-admin.sh` en el bloque de ejemplo de scripts
