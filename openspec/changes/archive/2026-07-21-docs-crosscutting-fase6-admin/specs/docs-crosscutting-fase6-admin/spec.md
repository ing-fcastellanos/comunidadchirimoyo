## ADDED Requirements

### Requirement: Documentación cross-cutting refleja apps/admin y Fase 6
`CLAUDE.md`, `README.md` y `docs/architecture/overview.md` SHALL describir `apps/admin`, la ubicación de noticias/jornadas en Firestore (ADR-0028) y la auth Firebase-native del panel (ADR-0029/0030), sin contradecir ningún ADR Accepted.

#### Scenario: Un agente o colaborador nuevo lee CLAUDE.md
- **WHEN** alguien lee `CLAUDE.md` para entender el proyecto por primera vez
- **THEN** encuentra `apps/admin` listada entre las apps, un aviso crítico explicando que noticias/jornadas viven en Firestore (no en `content/`), y la tabla de stack no afirma que "no hay auth de usuarios" sin la salvedad del panel admin

#### Scenario: Alguien consulta el diagrama de arquitectura
- **WHEN** alguien lee `docs/architecture/overview.md` para entender los boundaries del sistema
- **THEN** el diagrama incluye `apps/admin`, existe una subsección de boundaries para `apps/admin`, y la subsección de `apps/sitio` ya no afirma que noticias/jornadas se leen de `content/` en build

### Requirement: Roadmap y gestión de proyecto documentan Fase 6
`ROADMAP.md` y `docs/project-management.md` SHALL documentar Fase 6 (Contenido dinámico + Admin) como fase existente, consistente con el milestone, los labels y los scripts ya presentes en el repositorio/GitHub.

#### Scenario: Alguien revisa el roadmap de fases
- **WHEN** alguien lee `ROADMAP.md` o `docs/project-management.md` para entender en qué fase va el proyecto
- **THEN** encuentra una fila para Fase 6 en la tabla de fases, los ADR-0027 a ADR-0030 citados en `ROADMAP.md`, y `subdomain: admin` listado en la taxonomía de labels de `docs/project-management.md`
