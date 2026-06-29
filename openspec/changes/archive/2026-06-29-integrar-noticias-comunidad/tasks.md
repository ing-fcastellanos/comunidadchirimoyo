# Tasks — integrar-noticias-comunidad

## 1. Bloque "Últimas noticias" en /comunidad

- [x] 1.1 `app/comunidad/page.tsx` → Server Component **async**; `const notas = await getAllNoticias()`
- [x] 1.2 Conservar `h1`/intro; quitar "Noticias" del texto «próximamente» (deja "Historia · Misión")
- [x] 1.3 Si `notas.length > 0`: sección con `SectionTitle` (kicker "Comunidad", "Últimas noticias"), grilla (1/2/3 col) de `notas.slice(0,3)` con `NoticiaCard`, y enlace "Ver todas las noticias → /comunidad/noticias"
- [x] 1.4 Si `notas.length === 0`: no renderizar el bloque (sin hueco ni error)

## 2. Enlaces de navegación

- [x] 2.1 `components/layout/Header.tsx` — añadir `{ titulo: "Noticias", url: "/comunidad/noticias" }` al `NAV` (orden: Comunidad · Noticias · Voluntarios · Aves); verificar que aparece en escritorio y en `MobileNav`
- [x] 2.2 `components/layout/Footer.tsx` — añadir un enlace "Noticias" a `/comunidad/noticias` en una sección de enlaces, consistente con el estilo actual

## 3. Verificación

- [x] 3.1 `npm run typecheck` y `npm run build` en `apps/sitio` sin errores
- [x] 3.2 Dev (nota de ejemplo visible): `/comunidad` muestra el bloque con la tarjeta + "Ver todas" → `/comunidad/noticias`; el `h1`/intro se conservan
- [x] 3.3 Estado vacío: con 0 publicadas (simular o revisar render de prod), el bloque no aparece y la página no rompe
- [x] 3.4 Nav: "Noticias" presente en Header (escritorio + móvil) y Footer, ambos a `/comunidad/noticias`