# Tasks — donaciones-en-voluntarios

## 1. Página /voluntarios

- [x] 1.1 `apps/sitio/app/voluntarios/page.tsx` — importar `Donaciones` (`@/components/landing/Donaciones`) y `getDonaciones` (`@/lib/landing`); añadir `getDonaciones()` al `Promise.all` existente
- [x] 1.2 Renderizar `<Donaciones data={donaciones} />` como última sección, tras el formulario de inscripción (orden: intro → próximas jornadas → inscripción → donaciones)

## 2. Verificación

- [x] 2.1 `npm run build` en `apps/sitio` sin errores
- [x] 2.2 Dev: `/voluntarios` muestra la sección de donaciones al final (transferencia SPEI/CLABE, Spin, en especie), reutilizando el mismo render que el landing
- [x] 2.3 Confirmar que el landing (`/`) sigue mostrando donaciones igual (sin regresión) y que no se tocó `donaciones.json` ni `Donaciones.tsx`
