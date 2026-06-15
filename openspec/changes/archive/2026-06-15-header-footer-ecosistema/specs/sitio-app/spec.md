## ADDED Requirements

### Requirement: Header del ecosistema con navegación cross-subdominio y menú móvil

El `Header` compartido de `apps/sitio` SHALL ofrecer navegación al ecosistema (Comunidad,
Voluntarios, Aves) mediante **URLs absolutas de subdominio** (de `lib/links.ts`), no rutas
relativas, de modo coherente con el resto del sitio (ADR-0008). El logo SHALL enlazar al inicio
del sitio actual (`/`). En viewports de escritorio los enlaces SHALL mostrarse en línea; en
móvil SHALL ofrecerse un **botón hamburguesa** que abre un menú (drawer) accesible. El menú
móvil SHALL: exponer `aria-expanded`/`aria-controls` en el botón; cerrarse con la tecla Escape,
con clic fuera (backdrop) y al elegir un enlace; atrapar el foco mientras está abierto y
devolverlo al botón al cerrar; y bloquear el scroll del fondo. El estado del menú es lo único
que SHALL vivir en cliente.

#### Scenario: Navegación a subdominios absolutos
- **WHEN** el usuario activa "Comunidad", "Voluntarios" o "Aves" en el Header
- **THEN** navega a la URL absoluta del subdominio correspondiente (no a una ruta relativa bajo el host actual)

#### Scenario: Menú móvil accesible
- **WHEN** en un viewport móvil se abre el menú hamburguesa
- **THEN** se muestra el drawer con los enlaces y se puede cerrar con Escape, clic fuera o al elegir un enlace, con el foco gestionado y el scroll del fondo bloqueado

#### Scenario: Logo al inicio del sitio
- **WHEN** el usuario activa el logo
- **THEN** navega al inicio del sitio actual (`/`)

### Requirement: Footer del ecosistema desde contenido

El `Footer` compartido de `apps/sitio` SHALL ser un Server Component que derive sus enlaces de
`content/landing/enlaces.json` (vía el data-layer, en build), incluyendo: un bloque de marca con
nombre y tagline; **redes sociales** (p. ej. Facebook, Instagram) con sus íconos enlazando a las
URLs definidas; los **sitios del ecosistema**; **contacto** (email vía `mailto:` y teléfono vía
`tel:`) y un enlace de ubicación ("cómo llegar") al mapa; y una línea **legal** con enlaces a
`/privacidad`, `/aliados` y `/galeria`. El enlace a `/privacidad` SHALL incluirse aunque la
página todavía no exista (se crea en otro cambio). El Footer NO SHALL hardcodear los enlaces que
provienen del contenido.

#### Scenario: Redes y enlaces derivados del contenido
- **WHEN** se edita una red o un dato de contacto en `enlaces.json` y se reconstruye
- **THEN** el Footer refleja el cambio sin editar el componente

#### Scenario: Enlace legal a privacidad sembrado
- **WHEN** se renderiza el Footer
- **THEN** existe un enlace "Aviso de privacidad" hacia `/privacidad` (aunque la página aún devuelva 404 hasta que se cree)

#### Scenario: Contacto accionable
- **WHEN** el usuario activa el email o el teléfono del Footer
- **THEN** se abren `mailto:` y `tel:` respectivamente con los datos de `enlaces.json`
