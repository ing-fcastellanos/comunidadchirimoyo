<!-- Fuente visual: handoff v0.dev en
     C:\Users\Frank\Downloads\chirimoyo-handoff\guia-aves-chirimoyo\project\
     (Header.jsx, Footer.jsx, guia-de-estilo.html). Referencia de convenciones:
     C:\Users\Frank\source_code\sociedadsalvaje\apps\lectores -->

## 1. Andamiaje base

- [x] 1.1 Crear `apps/catalogo` con Next 15 (App Router) + TypeScript + Tailwind v4 + `@tailwindcss/postcss`
- [x] 1.2 `next.config.ts`: `output: "export"` + config de `images` para estático
- [x] 1.3 `tsconfig.json` con alias `@/*` → `./*`; `postcss.config.mjs`; `eslint.config.mjs`
- [x] 1.4 `package.json`: scripts `dev`/`build`/`start`/`lint`/`typecheck` + dependencias (react 19, lucide-react, clsx, tailwind-merge, sharp)
- [x] 1.5 `.gitignore` de la app (node_modules, .next, out) — verificar que la raíz ya cubre lo demás

## 2. Sistema de diseño

- [x] 2.1 Ejecutar `node scripts/sync-design-tokens.mjs` → genera `apps/catalogo/app/tokens.css`
- [x] 2.2 `app/globals.css`: `@import "tailwindcss";` + `@import "./tokens.css";`
- [x] 2.3 `lib/fonts.ts` (copia de `docs/design-system/fonts.ts`): next/font Cormorant + Source Sans 3
- [x] 2.4 `lib/utils.ts` con `cn()` (clsx + tailwind-merge) y `components.json` de shadcn
- [x] 2.5 Copiar primitivas a `components/ui/` (`Badge`, `Section`, `SectionTitle`, `Icon`) desde `docs/design-system/primitives/`

## 3. Layout y placeholder

- [x] 3.1 Portar `Header` y `Footer` del handoff a `components/layout/` (JSX → TSX, iconos con lucide-react, Server Components)
- [x] 3.2 `app/layout.tsx`: aplicar variables de fuente en `<html>`, `metadata`/OpenGraph base (`metadataBase` = https://aves.chirimoyo.org), Header + Footer
- [x] 3.3 `app/page.tsx`: home placeholder que usa tokens y primitivas (prueba visual del diseño)
- [x] 3.4 `public/`: favicon y assets base (logo del handoff si aplica)

## 4. Acceso a contenido

- [x] 4.1 `lib/content.ts`: loader stub tipado que resuelve `content/fauna/` desde la raíz del repo (default relativo + override `CONTENT_DIR`)
- [x] 4.2 Definir los tipos TypeScript del esquema de ficha (alineados con #9) sin parsear datos reales aún

## 5. Despliegue (config, sin desplegar)

- [x] 5.1 `firebase.json`: `"public": "out"`, target `prod`, sin rewrite a Cloud Run
- [x] 5.2 `.firebaserc`: proyecto `chirimoyo`, target de hosting `prod` (nombre de site provisional, documentado; se fija al conectar DNS en #3)
- [x] 5.3 Script `deploy_prod` en `package.json`: `next build && firebase deploy --only hosting:prod`
- [x] 5.4 `apps/catalogo/README.md`: comandos, modelo de hosting estático, cómo re-sincronizar tokens

## 6. Decisión documentada

- [x] 6.1 Escribir **ADR-0014** (catálogo como export estático en Firebase Hosting, sin Cloud Run; divergencia de ADR-0003)
- [x] 6.2 Actualizar el índice en `docs/adr/_index.md`

## 7. Verificación

- [x] 7.1 `npm run dev` levanta la app y la home placeholder renderiza con el sistema de diseño
- [x] 7.2 `npm run build` genera `out/` sin errores; `npm run typecheck` y `npm run lint` pasan
- [x] 7.3 Confirmar que no hay `Dockerfile` ni rewrite a Cloud Run y que `firebase.json` sirve `out/`
