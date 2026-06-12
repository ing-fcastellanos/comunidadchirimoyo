## 1. Esquema: campos de detalle (Tier B)

- [x] 1.1 Añadir `autoridad`, `otrosNombres[]`, `envergadura`, `mejorHora` (opcionales) a `FichaEspecie` en `lib/fauna-schema.ts` y al mapeo del loader en `lib/content.ts`
- [x] 1.2 Documentar los campos Tier B (nuevos + `medidas`/`habitat`/`temporada`) y sus columnas CSV en `content/README.md`
- [x] 1.3 Añadir los campos a `content/fauna/aves/_ejemplo.md`

## 2. Migración: columnas Tier B

- [x] 2.1 En `scripts/migrar-fauna.py`, mapear `autoridad`/`envergadura`/`mejor_hora` (texto), `otros_nombres` (`;`), `tamano_cm`/`peso_g` (rango → `medidas`, soporta decimales), `habitat` (`;`, frases), `temporada_meses` (`;`); el marcador `[dato faltante]` se trata como vacío
- [x] 2.2 Regenerar las 63 fichas con `--force`: autoridad 63 · otrosNombres 63 · envergadura 47 (16 faltantes omitidos) · mejorHora 63 · medidas 63 · habitat 63 · temporada 21; 503 fotos intactas

## 3. Datos y parseo

- [x] 3.1 `lib/ficha.ts`: `parseSecciones(cuerpo)` → `{ descripcion, dietaEcologia, reproduccion, distribucion, comoIdentificarla, dondeObservarla, sabiasQue }` (match `##` insensible a acentos/caso)
- [x] 3.2 View-model de detalle: `badgesDe` (estatus completos), `fotosVista` (→`fotoUrl(...,'web')`), `relacionadas` (familia→categoría), `resumenDescripcion`
- [x] 3.3 Añadir etiquetas de `habitat` + de estatus a `lib/dictionary.ts`

## 4. Componentes de la ficha

- [x] 4.1 `components/ficha/FichaCarrusel.tsx` (Client): carrusel + lightbox (teclado, bloqueo de scroll) **con créditos/atribución** por foto
- [x] 4.2 Secciones server en `components/ficha/secciones.tsx`: `HeroFicha`, `QuickFacts`, `DescripcionSec`, `DetailCards`, `DistribucionSec` (mapa placeholder), `ObservacionSec`, `ConservacionSec`, `TaxonomiaSec`
- [x] 4.3 `RelacionadasNav` (enlaces a especies relacionadas)
- [x] 4.4 Iconos: se reusan las primitivas `Icon`/`SectionTitle` (lucide-react) de `components/ui`; el carrusel usa `lucide-react` directo

## 5. Ruta y metadata

- [x] 5.1 `app/aves/[slug]/page.tsx` (Server) + `generateStaticParams()` (slugs) que ensambla las secciones
- [x] 5.2 `generateMetadata()` por especie: `title`, `description`, `openGraph.image` (URL `web` absoluta), twitter card
- [x] 5.3 Actualizar `fichaToBird.href` en `lib/search.ts` de `/<slug>` a `/aves/<slug>`

## 7. Pull-quote en la Descripción (fidelidad al handoff)

- [x] 7.1 Añadir `pullQuote?` (opcional) al esquema (`fauna-schema.ts` + loader) y documentarlo en `content/README.md` y `_ejemplo.md`
- [x] 7.2 Migración: mapear la columna `pull_quote` (tolerante a faltante) y añadir la columna vacía al CSV de origen para que el experto la complete
- [x] 7.3 Restaurar `DescripcionSec` a 2 columnas + aside con el pull-quote (tolerante: el aside aparece solo si hay cita)

## 6. Verificación

- [x] 6.1 `npm run typecheck` y `npm run build` pasan; export estático con `out/aves/<slug>.html` para las 63 especies
- [x] 6.2 OpenGraph por especie presente (og:image del bucket, og:title = nombre); 6 enlaces de relacionadas a `/aves/<slug>`
- [x] 6.3 Verificación en dev (`preview_inspect`/`eval`): h1 Cormorant+forest-deep, 8 secciones, 4 badges del hero, carrusel con foto del bucket cargada y crédito CC; funciona **sin** datos Tier B
