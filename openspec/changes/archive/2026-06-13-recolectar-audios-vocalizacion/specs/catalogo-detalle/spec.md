## ADDED Requirements

### Requirement: Sección de Vocalización con reproductor nativo

Cuando una especie declara `audios`, la ficha de detalle SHALL mostrar una sección **Vocalización** con un reproductor de audio **nativo** (`<audio controls>`, sin JavaScript de cliente, compatible con el export estático). El audio SHALL servirse desde el bucket componiendo la URL con un helper `audioUrl(slug, archivo)` que reusa `NEXT_PUBLIC_FAUNA_CDN_BASE`. La sección SHALL reemplazar el canto **sintetizado** (Web Audio) del handoff de diseño, que NO SHALL usarse. Cuando la ficha no declara `audios`, la sección NO SHALL renderizarse (tolerante, igual que el resto de secciones opcionales).

#### Scenario: Especie con audio muestra el reproductor
- **WHEN** una ficha declara al menos un `audio`
- **THEN** la ficha de detalle muestra la sección Vocalización con un `<audio controls>` cuyo `src` apunta al bucket vía `audioUrl(slug, archivo)`

#### Scenario: Especie sin audio omite la sección
- **WHEN** una ficha no declara `audios`
- **THEN** la sección Vocalización no aparece y el resto de la ficha se renderiza correctamente

#### Scenario: Sin canto sintetizado
- **WHEN** se renderiza la sección Vocalización
- **THEN** reproduce el archivo real de la especie y no genera ningún tono sintetizado por Web Audio

#### Scenario: Compatible con export estático
- **WHEN** se ejecuta `npm run build` (export estático)
- **THEN** la sección se genera sin requerir JavaScript de cliente para reproducir

### Requirement: Atribución de la vocalización

La sección Vocalización SHALL mostrar la atribución de la grabación **compuesta a partir de los campos** del audio (no de un texto almacenado), con la fórmula `"<credito>, <fuenteId>, xeno-canto.org"` y un enlace al texto de la licencia (`licenciaUrl`) y a la página de la grabación (`creditoUrl`) cuando existan. El rótulo del tipo (`Canto`/`Llamado`) SHALL mostrarse cuando `tipo` esté presente.

#### Scenario: Crédito compuesto desde campos
- **WHEN** un audio declara `credito`, `fuenteId` y `licencia`
- **THEN** la atribución mostrada es `"<credito>, <fuenteId>, xeno-canto.org"` con enlace a la licencia, sin depender de ningún campo de leyenda almacenado

#### Scenario: Tipo de vocalización rotulado
- **WHEN** un audio declara `tipo` (`canto` o `llamado`)
- **THEN** la sección lo indica; si no lo declara, se omite el rótulo sin romper la atribución
