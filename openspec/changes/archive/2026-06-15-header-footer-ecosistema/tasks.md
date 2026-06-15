## 1. Header del ecosistema (#55)

- [x] 1.1 Portar `HeaderEcosistema` del handoff v0.dev: `Header.tsx` Server Component (logo + nav escritorio) + subcomponente cliente `MobileNav` para el drawer
- [x] 1.2 Usar `lib/links.ts` (`COMUNIDAD_URL`/`VOLUNTARIOS_URL`/`AVES_URL`) para la nav; logo → `/`
- [x] 1.3 Menú móvil accesible: `aria-expanded`/`aria-controls`, cierre con Escape / clic fuera / al elegir enlace, focus trap, scroll lock; íconos vía wrapper `Icon` (kebab→PascalCase); `font-600/700`→pesos nombrados
- [x] 1.4 Sin colores hex fuera de `tokens.css`

## 2. Footer del ecosistema (#55)

- [x] 2.1 Portar `FooterEcosistema` del handoff v0.dev a `Footer.tsx` (Server Component)
- [x] 2.2 Alimentar desde `getEnlaces()` (`enlaces.json`): marca + tagline, **redes** (facebook/instagram), sitios, contacto (mailto/tel), "cómo llegar" (mapsUrl)
- [x] 2.3 Línea legal con enlaces a `/privacidad` (al vacío, #56), `/aliados`, `/galeria`
- [x] 2.4 Sin hardcodear enlaces que vienen del contenido; íconos vía `Icon`; tokens

## 3. Verificación

- [x] 3.1 `npm run build` + `lint` + `typecheck` en `apps/sitio` en verde
- [x] 3.2 Verificar en preview (móvil ~380px y desktop): nav de escritorio, hamburguesa abre/cierra (Escape, clic fuera, elegir enlace), foco y scroll-lock; Footer con redes y enlaces; `/privacidad` enlazado (404 esperado)
- [x] 3.3 Confirmar que editar `enlaces.json` cambia el Footer sin tocar el componente
