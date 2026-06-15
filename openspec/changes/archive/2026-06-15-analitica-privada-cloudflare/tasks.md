## 0. Decisión arquitectónica (ADR)

- [x] 0.1 Escribir ADR-0020 (Cloudflare Web Analytics) que supersede al ADR-0010; marcar 0010 como `Superseded by ADR-0020` y actualizar el índice de ADRs

## 1. Alta en Cloudflare — MANUAL (tú)

- [x] 1.1 Crear cuenta en Cloudflare (gratis) si no existe
- [x] 1.2 Dar de alta 4 "sites" en Web Analytics (uno por dominio): `chirimoyo.org`, `comunidad.chirimoyo.org`, `voluntarios.chirimoyo.org`, `aves.chirimoyo.org`
- [x] 1.3 Anotar los 4 tokens de beacon

## 2. Componente de analítica compartido

- [x] 2.1 Crear `apps/sitio/components/Analytics.tsx` (`"use client"`): lee `NEXT_PUBLIC_CF_BEACON_TOKENS` (mapa host→token), resuelve el token por `window.location.hostname`, renderiza `null` si no hay config o el host no mapea
- [x] 2.2 Cargar el beacon con `next/script` (`strategy="afterInteractive"`), atributo `data-cf-beacon` con el token resuelto
- [x] 2.3 Copiar el componente a `apps/catalogo/components/Analytics.tsx` (compartir por copia, ADR-0013)

## 3. Integración en las apps

- [x] 3.1 Insertar `<Analytics />` en el `<body>` de `apps/sitio/app/layout.tsx`
- [x] 3.2 Insertar `<Analytics />` en el `<body>` de `apps/catalogo/app/layout.tsx`

## 4. Configuración por entorno

- [x] 4.1 (MANUAL, requiere 1.x) Añadir `NEXT_PUBLIC_CF_BEACON_TOKENS` con tokens reales a `.env.local` de ambas apps
- [x] 4.2 Crear/actualizar `.env.example` en ambas apps documentando la variable (sin valores reales)
- [x] 4.3 (MANUAL, deploy) Inyectar la variable en el build de `catalogo` (export estático) — documentado en la guía
- [ ] 4.4 (DIFERIDA → al desplegar `sitio`; rastreada en #24) Inyectar la variable en el entorno de Cloud Run de `sitio` — documentado en el README
- [x] 4.5 Documentar la variable en los README/guías de despliegue (`docs/guias/desplegar-aves-produccion.md` y el de `sitio`)

## 5. Transparencia en privacidad — DIFERIDA a #44

> El sitio aún no tiene aviso de privacidad. La línea de transparencia se añadirá al crear esa página en el issue #44; esta tarea no se ejecuta en este cambio.

- [ ] 5.1 (diferida #44) Añadir la línea de transparencia al aviso de privacidad cuando exista: analítica agregada sin cookies de rastreo ni datos personales (coherente con ADR-0020 y ADR-0012)

## 6. Verificación

- [x] 6.1 `aves.chirimoyo.org` ✅ confirmado: pageview en el panel de Cloudflare. Los 3 dominios de `sitio` quedan DIFERIDOS → al desplegar `sitio` (rastreado en #24)
- [ ] 6.2 (DIFERIDA → al desplegar `sitio`; rastreada en #24) Verificar en DevTools que no se establecen cookies de rastreo ni se envía PII, y que no aparece banner
- [x] 6.3 Verificar que sin la env var la app funciona con la analítica desactivada (degradación segura) — `sitio` dev: home 200, sin beacon de analítica
- [x] 6.4 Verificar que en localhost (host no mapeado) no se inyecta el beacon — confirmado + garantizado por la lógica del componente

## 7. Cierre

- [x] 7.1 Actualizar la épica #24 con lo implementado y lo diferido — comentario publicado
