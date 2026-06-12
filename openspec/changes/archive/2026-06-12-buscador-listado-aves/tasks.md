## 1. Esquema: 5 campos de búsqueda

- [x] 1.1 Añadir tipos `forma`, `tamano`, `colores`, `donde`, `featured` (opcionales, vocabularios cerrados) a `FichaEspecie` en `apps/catalogo/lib/content.ts`
- [x] 1.2 Documentar los 5 campos y sus vocabularios en `content/README.md`
- [x] 1.3 Añadir los 5 campos a `content/fauna/aves/_ejemplo.md` como referencia

## 2. Migración: mapear las columnas nuevas

- [x] 2.1 En `scripts/migrar-fauna.py`, mapear `forma`/`tamano`/`donde` (únicos), `colores` (split `;`) y `featured` (parse boolean), validando contra los vocabularios
- [x] 2.2 Regenerar las 63 fichas con `--force` y verificar 63/63 con los 5 campos (503 fotos intactas, distribuciones = CSV)

## 3. Datos para la UI

- [x] 3.1 Crear `apps/catalogo/lib/dictionary.ts` portando `CATS/PRESENCE/OBSERVATION/SHAPES/SIZES/COLORS/WHERES/QUICKS` del handoff (tipado), con presencia "Introducida" en vez de "Invasora"
- [x] 3.2 Crear `apps/catalogo/lib/search.ts`: mapeo `FichaEspecie → bird` + filtrado/orden en cliente (`filterAndSort`)

## 4. Componentes de búsqueda y resultados

- [x] 4.1 Portar iconografía en `components/search/Icons.tsx`: `Ico` (SVG propios del handoff) + `ShapeIcon` (7 siluetas)
- [x] 4.2 `BirdCard` (vistas grid y lista) según el handoff
- [x] 4.3 `SearchPanel`: acordeón de 2 secciones (detallada: autocomplete + forma/tamaño/color/dónde + filtros avanzados; rápidas: tarjetas de atajo)
- [x] 4.4 Barra de resultados (conteo + orden + grid/lista), pills de filtros activos y estado vacío (en `BuscadorAves.tsx`)
- [x] 4.5 Client Component contenedor (`BuscadorAves.tsx`) con el estado de filtros y `filterAndSort` en cliente

## 5. Página índice

- [x] 5.1 Sustituir la home placeholder (`app/page.tsx`) por el Server Component que carga `getAllFichas()`, mapea con `lib/search.ts` y monta `<BuscadorAves>`; se usan el `Header`/`Footer` del layout (sin enlaces de prototipo)

## 6. Verificación

- [x] 6.1 `npm run typecheck` y `npm run build` pasan en `apps/catalogo`; export estático con 63 cards en `out/index.html`
- [x] 6.2 Verificación visual en dev (`preview_inspect`): h1 y card h3 en Cormorant Garamond + `forest-deep`; 2 secciones, grid, pills y estado vacío presentes en el HTML; sin errores de consola
- [x] 6.3 Lógica de filtros/orden/vista portada 1:1 del handoff (typecheck ok); dev sirve 200 con enlaces de card a `/<slug>` y URLs de thumb del bucket
