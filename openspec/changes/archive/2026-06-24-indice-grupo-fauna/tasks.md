## 1. Rename group-agnostic de la card y su view-model

- [x] 1.1 En `lib/search.ts`: renombrar el tipo `Bird` → `Especie` y la función `fichaToBird` → `fichaToEspecie` (mismo shape; sin cambio de comportamiento).
- [x] 1.2 Renombrar `components/search/BirdCard.tsx` → `EspecieCard.tsx` (componente `BirdCard` → `EspecieCard`); actualizar props/tipos al nuevo nombre.
- [x] 1.3 Actualizar consumidores: `components/search/BuscadorAves.tsx`, `components/search/SearchPanel.tsx`, `app/[grupo]/buscador/page.tsx` (imports, tipos `Bird`→`Especie`, `fichaToBird`→`fichaToEspecie`, `BirdCard`→`EspecieCard`).
- [x] 1.4 `npx tsc --noEmit` para confirmar que el rename quedó consistente.

## 2. Card group-aware

- [x] 2.1 En `EspecieCard`, confirmar/asegurar que los traits aviares (`forma`/`dónde`) se omiten cuando la especie no los declara, sin dejar huecos (el render ya es condicional; verificar para herps).

## 3. Índice de grupo (grilla)

- [x] 3.1 Crear el componente de índice de grupo (header de grupo + grilla plana de `EspecieCard`): eyebrow `Catálogo de fauna · <Grupo>`, título `<Grupo> del Chirimoyo`, conteo `N especies`, intro breve; grilla ordenada por `nombreComun`.
- [x] 3.2 En `app/[grupo]/page.tsx`: cambiar el branch de `anfibios`/`reptiles` para que, si el grupo tiene fichas, renderice el índice-grilla; si no tiene fichas, siga mostrando `<Proximamente>`. `aves` sigue ramificando a `LandingAves`. Sin CTA al buscador.
- [x] 3.3 Verificar 404 para grupo inexistente (ya cubierto por `generateStaticParams` + `dynamicParams = false`).

## 4. Sitemap

- [x] 4.1 En `app/sitemap.ts`: incluir los índices de grupo con fichas (`/anfibios`, `/reptiles` además de `/aves`), derivando los grupos con fichas de `getAllFichas()` en vez de hardcodear solo `/aves`.

## 5. Verificación

- [x] 5.1 `npx tsc --noEmit` y `npm run lint` sin errores; `npm run validate:fichas` y `npm run build` verdes.
- [x] 5.2 Preview: `/anfibios` y `/reptiles` muestran header + grilla con todas las especies; cada card abre `/<grupo>/<slug>`; las cards de herps no muestran traits aviares vacíos.
- [x] 5.3 Preview: `/aves` intacto (landing curado); un grupo inexistente da 404.
- [x] 5.4 Confirmar que el sitemap generado incluye `/aves`, `/anfibios`, `/reptiles`.
- [x] 5.5 Evidencia de `/anfibios` vía verificación por DOM (`preview_eval`): el screenshot se cuelga por la carga de miniaturas full-res del bucket GCS remoto (igual que en #92/#93). DOM confirmado: header "Anfibios del Chirimoyo · 8 especies", 8 cards → `/anfibios/<slug>`, sin «Próximamente», sin trait "Dónde"; `/reptiles` 4 cards; `/aves` landing intacto; `/insectos` → 404; sitemap incluye los 3 índices (81 URLs).
