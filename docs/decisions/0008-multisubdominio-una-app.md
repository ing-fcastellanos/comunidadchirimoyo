# ADR-0008 — Multi-subdominio desde una sola app (`apps/sitio`)

- **Estado:** Accepted
- **Fecha:** 2026-06-07
- **Decisores:** @ing-fcastellanos
- **Issue:** _kickoff_

## Contexto

`chirimoyo.org`, `comunidad.chirimoyo.org` y `voluntarios.chirimoyo.org` comparten identidad visual, header/footer y estilo, y son todos sitios de contenido. Se decidió (ADR-0001) servirlos desde una sola app Next (`apps/sitio`). Falta definir el mecanismo técnico para que un solo deploy responda a tres subdominios mostrando el contenido correcto.

## Decisión

`apps/sitio` se despliega una vez en Cloud Run y se expone en los tres subdominios vía **Firebase Hosting con múltiples sites apuntando (rewrite) al mismo backend Cloud Run**. El ruteo por subdominio se resuelve combinando:

- Hosting sites de Firebase por subdominio (`chirimoyo`, `comunidad`, `voluntarios`), cada uno con su dominio personalizado conectado a Porkbun por DNS.
- En la app, **middleware de Next** lee el host de la request y enruta a la sección correspondiente (landing / comunidad / voluntarios), o se usan rutas dedicadas por sección con el dominio apuntando a su path raíz.

El detalle fino (middleware por host vs site-por-path) se afina en la issue de scaffold de Fase 0; la decisión de fondo es **una app, varios subdominios vía Firebase Hosting rewrites**.

## Alternativas consideradas

- **Una app Next por subdominio:** descrita y descartada en ADR-0001 (costo operativo).
- **Un dominio con paths (`chirimoyo.org/comunidad`):** más simple técnicamente, pero el responsable quiere subdominios dedicados por claridad y difusión. Descartada.
- **Reverse proxy propio (Nginx) en vez de Firebase Hosting:** más control, más operación. Innecesario habiendo Firebase Hosting en el stack.

## Consecuencias

### Positivas

- Un solo build/deploy para tres sitios; identidad y componentes compartidos sin duplicar.
- CDN de Firebase Hosting para los tres subdominios.

### Negativas

- El ruteo por host añade algo de complejidad en la app (middleware) frente a apps separadas.
- Un bug en `apps/sitio` afecta a los tres subdominios a la vez.

### Neutras

- `aves.chirimoyo.org` queda fuera de este esquema: vive en `apps/catalogo`, su propio deploy.

## Plan de revisión

Reconsiderar separar en apps distintas si algún subdominio diverge fuerte en stack, equipo o ritmo de cambios, o si el middleware por host se vuelve frágil.

## Referencias

- ADR-0001 (layout), ADR-0003 (hosting/DNS).
