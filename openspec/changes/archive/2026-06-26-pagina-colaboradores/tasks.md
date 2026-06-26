# Tasks — pagina-colaboradores

## 1. Contenido

- [x] 1.1 Crear `content/fauna/colaboradores.json` con `grupos[]` en orden, cada uno `{ rol, icono, personas[] }`; persona `{ nombre, aporte, enlace?, foto? }`. Seed real:
  - **Biólogos e identificación:** Juan Manuel Díaz García (Doctor en Ciencias Biológicas, fb juandiazgarcia); Angel Ivan Contreras Calvario (Maestro en Ciencias en Conservación y Aprovechamiento de Recursos Naturales, fb angelivan.contreras); Ángel Hernández Ramírez (Licenciado en Biología, fb angel.hernandez.906714)
  - **Fotografía:** Any Isabel Pérez Santiago; Diana Isela Angeles Solares
  - **Desarrollo:** Francisco Castellanos
- [x] 1.2 Documentar el esquema de `colaboradores.json` en `content/README.md`

## 2. Loader

- [x] 2.1 `apps/catalogo/lib/colaboradores.ts` — tipos `Colaborador` (`nombre`, `aporte`, `enlace?`, `foto?`) y `GrupoColaboradores` (`rol`, `icono?`, `personas`); `getColaboradores()` que lee el JSON con `node:fs` (override `CONTENT_DIR`, patrón de `content.ts`)

## 3. Página

- [x] 3.1 `apps/catalogo/app/colaboradores/page.tsx` — Server Component estático: encabezado (eyebrow + título + intro de agradecimiento), una `Section` por grupo con su `rol` y grilla de tarjetas (nombre, aporte, enlace con `target="_blank" rel="noopener noreferrer"`), reusando primitivos (`Section`, `Icon`, tarjeta tipo `GruposFauna`)
- [x] 3.2 Nota al pie de la página reconociendo fuentes externas (fotos CC de iNaturalist + grabaciones de xeno-canto, acreditadas por ficha), sin enumerarlas
- [x] 3.3 `generateMetadata` (title, description, OpenGraph) siguiendo el patrón de las demás páginas del catálogo

## 4. Navegación

- [x] 4.1 Añadir enlace a `/colaboradores` en `apps/catalogo/components/layout/Footer.tsx` (discreto, consistente con el estilo actual)

## 5. Verificación

- [x] 5.1 `npm run build` sin errores; existe `out/colaboradores.html` con los 3 grupos y sus personas (contenido real, no placeholders)
- [x] 5.2 Preview: `/colaboradores` renderiza agrupado por rol; los enlaces de biólogos abren su Facebook en pestaña nueva; el enlace del Footer lleva a la página
- [x] 5.3 `npm run smoke` sigue en verde (la nueva ruta no rompe enlaces/PDF/sin-API); confirmar que `/colaboradores` resuelve y no colisiona con `[grupo]`
- [x] 5.4 Confirmar que la página NO lista atribuciones CC externas ni grabadores de audio