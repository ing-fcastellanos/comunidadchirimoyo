## 1. Esquema y tipos

- [x] 1.1 Añadir el interface `Distribucion` (`{ cria?, invernada?, residente?, notas? }`, listas de códigos ISO) y el campo opcional `distribucion?` a `FichaEspecie` en `apps/catalogo/lib/fauna-schema.ts`
- [x] 1.2 Mapear `distribucion` en `apps/catalogo/lib/content.ts` y confirmar `npm run typecheck`
- [x] 1.3 Documentar el campo `distribucion` en `content/README.md` (zonas como códigos ISO, opcional, sin geometría)

## 2. Mapa base (asset precomputado)

- [x] 2.1 Escribir el script generador: lee Natural Earth admin-0 1:110m, recorta al encuadre Norte+Centro+Caribe (+N Sudamérica), proyecta equirectangular y simplifica
- [x] 2.2 Emitir el asset commiteado `apps/catalogo/lib/mapa-americas.ts` = `{ outline, regions: Record<ISO, path> }`; documentar versión/fuente de Natural Earth; no versionar el crudo
- [x] 2.3 Verificar que el build de `apps/catalogo` no incorpora librerías geo (solo lee el asset)

## 3. Render del mapa

- [x] 3.1 Añadir helper/view-model de distribución (zonas + tonos forest/mint/teal + etiqueta derivada de `estatusMigratorio`) en `apps/catalogo/lib/ficha.ts`
- [x] 3.2 Reescribir `DistribucionSec` en `secciones.tsx`: geografía real (`outline`) + marcador fijo de la laguna siempre; rellena `regions[code]` por zona cuando hay `distribucion`; leyenda solo de las zonas presentes. Retirar `MapaEsquematico`
- [x] 3.3 Fallback sin curaduría: geografía + marcador + etiqueta de estatus, anclado en México, sin inventar rango
- [x] 3.4 `npm run build`: confirmar export estático del mapa, on-brand, sin JS de cliente

## 4. Prototipo de validación

- [x] 4.1 Curar `distribucion` en `botaurus-lentiginosus` (migratoria-invierno: cría norte, invernada incl. MX)
- [x] 4.2 Curar `distribucion` en `aramides-albiventris` (residente: una zona)
- [x] 4.3 Revisar visualmente ambos casos (migratorio de 2 zonas y residente de 1 zona) en preview

## 5. Evaluación GBIF + ADR

- [x] 5.1 Prototipar una capa opcional de puntos GBIF con atribución; medir contra el criterio de corte (licencia redistribuible, peso/fricción, ruido visual)
- [x] 5.2 Tomar veredicto (adoptar/descartar) y dejar el mapa funcionando sin esa capa
- [x] 5.3 Crear `docs/decisions/0018-mapa-distribucion-geografia-real.md` (geografía real + zonas curadas por país, estático, Natural Earth; registra el veredicto GBIF) y actualizar `docs/adr/_index.md`
- [x] 5.4 `openspec validate mapa-distribucion-especie`; preparar PR que cierre #27
