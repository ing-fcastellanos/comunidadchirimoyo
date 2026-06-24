## Why

Al verificar el detalle de especie para anfibios/reptiles (#92, parte de #17) se descubre que el render del detalle nunca se hizo *group-aware*: solo se generalizaron el esquema y el loader (#87). Quedaron **bird-isms hardcodeados** que ahora son incorrectos para herpetofauna, dos de ellos errores factuales/de atribución:

- `TaxonomiaSec` fija `["Clase", "Aves"]` → una rana muestra **«Clase: Aves»** (error factual).
- `audiosVista` compone el crédito como `"<credito>, <fuenteId>, xeno-canto.org"` → las 7 grabaciones de herpetofauna (todas de **iNaturalist**, prefijo `iNat…`) se **atribuyen a xeno-canto** (error de atribución; la spec `catalogo-detalle` literalmente fija esa fórmula).
- El copy de `VocalizacionSec` dice *"Las aves usan la voz… comunidad de xeno-canto"* → texto falso para anuros.
- El ícono `Bird` aparece en el hero (kicker "Ficha de especie") y en "Especies relacionadas" → una rana con ícono de ave.

Los criterios de #92 que **ya** renderizan bien (medidas LHC vía `medidas.criterio`, NOM-059, badge "Residente", bloques resumen) se mantienen; este cambio cierra los huecos restantes.

Sub-dominio afectado: **aves** (catálogo de fauna). Sin impacto en sitio, voluntarios ni api.

## What Changes

- **Clase taxonómica por grupo:** nuevo `CLASE_LABEL: Record<Grupo, string>` en `lib/dictionary.ts` (`aves`→`Aves`, `anfibios`→`Amphibia`, `reptiles`→`Reptilia`); `TaxonomiaSec` usa `CLASE_LABEL[ficha.grupo]` en vez del literal `"Aves"`.
- **Atribución de audio por fuente real:** `audiosVista` (`lib/ficha.ts`) deriva la fuente del `fuenteId` (`XC…`→`xeno-canto.org`, `iNat…`→`iNaturalist`) en lugar de hardcodear `xeno-canto.org`. **BREAKING** (corrige) la fórmula de atribución especificada en `catalogo-detalle`.
- **Encuadre group-aware de la vocalización:** el copy de `VocalizacionSec` se adapta al grupo (aves vs. anuros) y nombra la **fuente real** de la grabación (xeno-canto / iNaturalist) en vez de "xeno-canto" fijo.
- **Ícono por grupo:** nuevo `GRUPO_ICON: Record<Grupo, IconName>` (`aves`→`Bird`, `anfibios`→`Droplet`, `reptiles`→`Turtle`); lo usan el kicker del `HeroFicha` y el título de `RelacionadasNav`.

## Capabilities

### New Capabilities
_(ninguna)_

### Modified Capabilities
- `catalogo-detalle`: el render del detalle pasa a ser **group-aware**. Se modifica el requisito de **atribución de la vocalización** (la fuente se deriva del dato, no es `xeno-canto.org` fijo) y se añade un requisito de **render group-aware** (clase taxonómica por grupo, ícono por grupo y encuadre de vocalización según grupo/fuente).

## Impact

- **Código (aves):** `lib/dictionary.ts` (`CLASE_LABEL`, `GRUPO_ICON`), `lib/ficha.ts` (`audiosVista` con fuente derivada), `components/ficha/secciones.tsx` (`TaxonomiaSec`, `HeroFicha`, `RelacionadasNav`, `VocalizacionSec`).
- **Datos:** ninguno — sin cambio de esquema ni de fichas. La fuente se infiere de `fuenteId`/`creditoUrl` ya presentes.
- **Dependencias:** ninguna nueva (íconos ya disponibles vía `lucide-react`).
- **Visible para el usuario:** las fichas de herpetofauna dejan de mostrar «Clase: Aves», la atribución de audio correcta, copy e ícono coherentes.

## No-goals

- No es **diseño v0.dev nuevo**: se generalizan componentes existentes, sin rediseño visual.
- No cambia el **esquema** de la ficha ni el contenido de los `content/fauna/`.
- No toca el render de **aves** salvo sustituir literales por valores derivados del grupo (comportamiento idéntico para aves).
- No aborda bird-isms fuera del **detalle** (buscador, hub, índice) — si existieran, van en su propio issue.
- No introduce audio para reptiles ni datos nuevos.
