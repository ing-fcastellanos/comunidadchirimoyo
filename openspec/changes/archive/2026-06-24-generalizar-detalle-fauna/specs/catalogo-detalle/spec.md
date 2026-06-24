## MODIFIED Requirements

### Requirement: Atribución de la vocalización

La sección Vocalización SHALL mostrar la atribución de la grabación **compuesta a partir de los campos** del audio (no de un texto almacenado), con la fórmula `"<credito>, <fuenteId>, <fuente>"`, donde `<fuente>` SHALL derivarse del dato de la grabación y NO SHALL estar fijada a `xeno-canto.org`. La fuente SHALL inferirse del prefijo de `fuenteId` (`XC…` → `xeno-canto.org`, `iNat…` → `iNaturalist`); si el prefijo no se reconoce, SHALL usarse el host de `creditoUrl` y, en su defecto, SHALL omitirse el segmento de fuente sin inventar una atribución. La atribución SHALL incluir un enlace al texto de la licencia (`licenciaUrl`) y a la página de la grabación (`creditoUrl`) cuando existan. El rótulo del tipo (`Canto`/`Llamado`) SHALL mostrarse cuando `tipo` esté presente.

#### Scenario: Crédito compuesto con fuente derivada (xeno-canto)
- **WHEN** un audio de un ave declara `credito`, `fuenteId: "XC123456"` y `licencia`
- **THEN** la atribución mostrada es `"<credito>, XC123456, xeno-canto.org"` con enlace a la licencia, sin depender de ningún campo de leyenda almacenado

#### Scenario: Crédito compuesto con fuente derivada (iNaturalist)
- **WHEN** un audio de herpetofauna declara `fuenteId: "iNat1999482"` y `creditoUrl` de inaturalist.org
- **THEN** la atribución mostrada nombra **iNaturalist** como fuente (no xeno-canto), con enlace a `creditoUrl`

#### Scenario: Fuente desconocida no inventa atribución
- **WHEN** un audio trae un `fuenteId` con prefijo no reconocido y sin `creditoUrl`
- **THEN** la atribución muestra `credito` (y `fuenteId`) sin un segmento de fuente inventado

#### Scenario: Tipo de vocalización rotulado
- **WHEN** un audio declara `tipo` (`canto` o `llamado`)
- **THEN** la sección lo indica; si no lo declara, se omite el rótulo sin romper la atribución

## ADDED Requirements

### Requirement: Render group-aware del detalle

El render de la ficha de detalle SHALL adaptarse al `grupo` de la especie (`aves` | `anfibios` | `reptiles`) sin literales específicos de aves. En particular:

- La tabla de **Taxonomía** SHALL mostrar la clase taxonómica correspondiente al grupo (`aves` → `Aves`, `anfibios` → `Amphibia`, `reptiles` → `Reptilia`), derivada de una tabla `CLASE_LABEL` por grupo, y NO SHALL mostrar `Aves` fijo para todas las especies.
- El **ícono** del encabezado de la ficha (kicker "Ficha de especie") y el de la navegación a especies relacionadas SHALL provenir de una tabla `GRUPO_ICON` por grupo (`aves` → `Bird`, `anfibios` → `Droplet`, `reptiles` → `Turtle`), de modo que una ficha de herpetofauna no muestre el ícono de ave.
- El **encuadre descriptivo** de la sección Vocalización SHALL adaptarse al grupo: para aves describe la voz de las aves; para anfibios describe el canto de ranas y sapos; para otros grupos usa un texto genérico. La frase de procedencia SHALL nombrar la fuente real de la grabación (derivada del audio), no `xeno-canto` fijo.

El comportamiento para las fichas de **aves** SHALL permanecer idéntico al actual (los valores derivados coinciden con los literales previos). Ningún campo de esquema ni de datos SHALL cambiar; los valores se derivan del `grupo` y de los campos del audio ya presentes.

#### Scenario: Clase taxonómica según el grupo
- **WHEN** se abre el detalle de un anfibio (`grupo: anfibios`)
- **THEN** la fila "Clase" de la tabla de taxonomía muestra `Amphibia` (no `Aves`)

#### Scenario: Ícono según el grupo
- **WHEN** se abre el detalle de un reptil (`grupo: reptiles`)
- **THEN** el ícono del kicker y el de especies relacionadas son el del grupo reptiles (no `Bird`)

#### Scenario: Encuadre de vocalización para anuros
- **WHEN** se abre el detalle de un anuro con audio
- **THEN** el texto descriptivo de la sección Vocalización habla de ranas/sapos y nombra **iNaturalist** como fuente, sin afirmar "Las aves usan la voz" ni "xeno-canto"

#### Scenario: Aves sin regresión
- **WHEN** se abre el detalle de un ave
- **THEN** la clase es `Aves`, el ícono es `Bird` y el encuadre de vocalización es el de aves con `xeno-canto.org` como fuente — idéntico al comportamiento previo
