## ADDED Requirements

### Requirement: Asset de mapa base precomputado desde Natural Earth

El proyecto SHALL generar, mediante un script ejecutado fuera del build de Next, un asset commiteado `apps/catalogo/lib/mapa-americas.ts` a partir de **Natural Earth admin-0 1:110m** (dominio público). El script SHALL recortar al encuadre **Norte + Centroamérica + Caribe (+ norte de Sudamérica)**, proyectar con proyección **equirectangular** y simplificar, emitiendo `{ outline: string, regions: Record<string, string> }`, donde las claves de `regions` son códigos **ISO 3166-1 alpha-2** y los valores son paths SVG. El crudo de Natural Earth NO SHALL versionarse; solo el asset derivado. El build de `apps/catalogo` NO SHALL depender de librerías geográficas en tiempo de build ni de cliente.

#### Scenario: Asset generado y commiteado
- **WHEN** se ejecuta el script generador del mapa base
- **THEN** existe `apps/catalogo/lib/mapa-americas.ts` con `outline` y `regions` indexadas por código ISO alpha-2

#### Scenario: Sin dependencias geo en el build
- **WHEN** se ejecuta `npm run build` en `apps/catalogo`
- **THEN** el build no requiere librerías geográficas ni datos de Natural Earth (solo el asset commiteado)

### Requirement: Render estático del mapa de distribución por especie

La ficha de detalle SHALL renderizar, como Server Component sin JavaScript de cliente, un mapa de **geografía real** (el `outline` del asset) con un **marcador fijo de la Laguna del Chirimoyo** en todas las especies. Cuando la ficha declara `distribucion`, el mapa SHALL rellenar las regiones referenciadas por código ISO en tonos diferenciados por zona: **cría** (forest), **invernada** (mint) y **residente** (teal). La leyenda SHALL listar solo las zonas presentes y SHALL derivar su etiqueta de `estatusMigratorio`. El render SHALL ser on-brand (paleta forest/mint del sistema de diseño) y SHALL reemplazar el placeholder `MapaEsquematico`.

#### Scenario: Especie con zonas curadas
- **WHEN** una ficha declara `distribucion` con regiones de cría e invernada
- **THEN** el mapa pinta esas regiones en sus tonos y la leyenda muestra ambas zonas

#### Scenario: Marcador local siempre presente
- **WHEN** se renderiza el mapa de cualquier especie
- **THEN** aparece el marcador de la Laguna del Chirimoyo sobre la geografía real

#### Scenario: Compatible con export estático
- **WHEN** se ejecuta `npm run build` (export estático)
- **THEN** el mapa se genera sin JavaScript de cliente

### Requirement: Fallback honesto sin curaduría

Cuando una ficha NO declara `distribucion`, el mapa NO SHALL inventar un rango multipaís: SHALL mostrar la geografía real, el marcador local y una etiqueta derivada de `estatusMigratorio` (p. ej. "Visitante de invierno", "Residente"), anclada en México. Las especies sin `distribucion` SHALL renderizar sin error.

#### Scenario: Especie sin distribución curada
- **WHEN** una ficha no declara `distribucion`
- **THEN** el mapa muestra geografía + marcador local + etiqueta de estatus, sin pintar un rango de países inventado

#### Scenario: Etiqueta derivada del estatus
- **WHEN** la especie es `migratoria-invierno`
- **THEN** la leyenda/etiqueta refleja que es visitante de invierno

### Requirement: Evaluación de la capa opcional de puntos GBIF

El cambio SHALL evaluar una capa **opcional** de puntos de ocurrencia GBIF con atribución, y SHALL documentar un veredicto (adoptar / descartar) según un criterio de corte explícito: se adopta solo si la licencia del dataset es redistribuible estáticamente, no añade peso/fricción desproporcionados y aporta señal sin ruido visual. GBIF NO SHALL ser la capa base del mapa. Si se descarta, el mapa SHALL funcionar sin ella.

#### Scenario: Veredicto documentado
- **WHEN** concluye la evaluación de la capa GBIF
- **THEN** el ADR registra si se adopta o se descarta y por qué

#### Scenario: El mapa no depende de GBIF
- **WHEN** la capa GBIF se descarta o no está disponible
- **THEN** el mapa de distribución se renderiza correctamente sin esa capa
