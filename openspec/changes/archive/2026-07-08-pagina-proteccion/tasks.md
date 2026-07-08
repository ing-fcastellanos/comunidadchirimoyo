# Tasks — pagina-proteccion

## 1. Contenido

- [x] 1.1 Crear `content/fauna/proteccion.json` con la forma acordada en `design.md` (`cifras`, `nom059[]`, `iucn[]`, `cites`, `fuentes[]`). Datos verificados contra `content/fauna/` (issue #78):
  - **Cifras:** 76 especies totales (64 aves, 8 anfibios, 4 reptiles → 12), 9 con categoría NOM-059
  - **NOM-059 «Pr» (Protección Especial):** Tlaconete, Rana Leopardo, Rana de Orejas Chicas, Iguana Verde, Zambullidor Menor, Polluela Rojiza, Oropéndola de Moctezuma
  - **NOM-059 «A» (Amenazada):** Avetoro Norteño, Culebra Listonada
  - **NOM-059 «P»/«E»:** sin especies en el humedal (indicar explícitamente, no omitir la categoría)
  - **CITES:** Iguana Verde, Apéndice II (citar el texto ya existente en `content/fauna/reptiles/iguana-iguana/index.md`)
  - **Fuentes:** CONABIO (categorías NOM-059 y mundiales), DOF (texto oficial NOM-059), IUCN Red List, CITES (apéndices oficiales), Enciclovida, NaturaLista
- [x] 1.2 Documentar el esquema de `proteccion.json` en `content/README.md`

## 2. Loader

- [x] 2.1 `apps/catalogo/lib/proteccion.ts` — tipos (`ProteccionData`, `Nom059Categoria`, `IucnCategoria`, `CitesEjemplo`, `FuenteGrupo`) y `getProteccion()` que lee el JSON con `node:fs` (mismo patrón que `lib/colaboradores.ts`)

## 3. Página

- [x] 3.1 `apps/catalogo/app/proteccion/page.tsx` — Server Component estático recreando el mockup de Claude Design (`components/Proteccion.jsx` / `Proteccion.html` del proyecto "Guia aves chirimoyo"): hero con 4 stat-cards, tarjetas NOM-059 (`Badge` tono `terra`, ícono por severidad, lista de especies o mensaje de "ninguna" si vacía), tabla IUCN sin escala de color, tarjeta CITES, bloque de cierre (fondo `pine`) con CTA hacia la búsqueda filtrada, y sección de fuentes agrupadas (mismo patrón de tarjetas que `/colaboradores`)
- [x] 3.2 `generateMetadata` (title, description, OpenGraph) siguiendo el patrón de las demás páginas del catálogo

## 4. Cruce con la búsqueda

- [x] 4.1 En `apps/catalogo/components/search/BuscadorGeneral.tsx`, leer `useSearchParams()` una vez al montar y, si `conservaciones` está presente, inicializar `Filters` con ese valor en vez de `EMPTY_FILTERS` (sin tocar `applyQuick`/`toggleVal`/`setOne`)
- [x] 4.2 En la página de protección, enlazar el CTA de cierre a `/busqueda?conservaciones=NOM-059`

## 5. Navegación

- [x] 5.1 Añadir enlace a `/proteccion` en `apps/catalogo/components/layout/Footer.tsx`, junto al de `/colaboradores`

## 6. Verificación

- [x] 6.1 `npm run build` sin errores; existe `out/proteccion.html` con las 4 categorías NOM-059, la tabla IUCN, el ejemplo CITES y las fuentes
- [x] 6.2 Preview: `/proteccion` renderiza el diseño aprobado en Claude Design; el CTA hacia `/busqueda?conservaciones=NOM-059` llega con el filtro NOM-059 ya activo (verificado: exactamente las 9 especies NOM-059 aparecen)
- [x] 6.3 Preview: `/busqueda` sin parámetros sigue arrancando con filtros vacíos (verificado: 76 especies sin filtrar)
- [x] 6.4 `npm run smoke` sigue en verde (13 pass · 1 skip · 0 fail); `/proteccion` resuelve y no colisiona con `[grupo]`
- [x] 6.5 Confirmar que ninguna cifra o especie mostrada en `/proteccion` es inventada — cruzada contra `content/fauna/` durante `/opsx:explore` y de nuevo en el preview
