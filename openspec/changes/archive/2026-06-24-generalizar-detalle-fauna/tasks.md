## 1. Tablas group-aware en dictionary

- [x] 1.1 Añadir `CLASE_LABEL: Record<Grupo, string>` (`aves: "Aves"`, `anfibios: "Amphibia"`, `reptiles: "Reptilia"`) en `apps/catalogo/lib/dictionary.ts`.
- [x] 1.2 Añadir `GRUPO_ICON: Record<Grupo, IconName>` (`aves: "Bird"`, `anfibios: "Droplet"`, `reptiles: "Turtle"`) en `dictionary.ts` (importando `IconName` de `components/ui/Icon`).

## 2. Atribución de audio por fuente derivada

- [x] 2.1 En `apps/catalogo/lib/ficha.ts`, añadir un helper puro que derive la fuente del audio: prefijo de `fuenteId` (`XC…`→`xeno-canto.org`, `iNat…`→`iNaturalist`); fallback al host de `creditoUrl`; en último caso, sin segmento de fuente.
- [x] 2.2 Cambiar `audiosVista` para componer el crédito como `"<credito>, <fuenteId>, <fuente>"` usando el helper (eliminar el `"xeno-canto.org"` hardcodeado); actualizar el comentario/JSDoc del campo `credito`.
- [x] 2.3 Exponer el nombre de fuente (p. ej. `fuenteNombre`) en `AudioVista` para que la copy de la sección lo nombre (Decisión 3).

## 3. Componentes group-aware del detalle

- [x] 3.1 `TaxonomiaSec` (`secciones.tsx`): usar `CLASE_LABEL[ficha.grupo]` en la fila "Clase" en vez del literal `"Aves"`.
- [x] 3.2 `HeroFicha` y `RelacionadasNav` (`secciones.tsx`): usar `GRUPO_ICON[ficha.grupo]` en vez de `Icon name="Bird"` (RelacionadasNav recibe el grupo o se le pasa la ficha).
- [x] 3.3 `VocalizacionSec` (`secciones.tsx`): copy group-aware (aves vs. anuros vs. genérico) y nombrar la fuente real derivada del audio en la frase de procedencia (no "xeno-canto" fijo).

## 4. Verificación

- [x] 4.1 `npx tsc --noEmit` en `apps/catalogo` sin errores.
- [x] 4.2 `npm run build` verde; arrancar `next start`/preview y abrir un **anuro con audio** (p. ej. `incilius-valliceps`): confirmar los 5 criterios de #92 — sonido con player + crédito a **iNaturalist**, medidas LHC, NOM-059, badge "Residente", bloques resumen.
- [x] 4.3 Abrir un **reptil** y un **anfibio sin audio**: confirmar Clase correcta (`Reptilia`/`Amphibia`), ícono de grupo, sin sección de Vocalización cuando no hay audio.
- [x] 4.4 Abrir un **ave** (regresión): Clase `Aves`, ícono `Bird`, atribución `xeno-canto.org`, copy de aves — idéntico a antes.
- [x] 4.5 Evidencia de cierre de #92 vía verificación por DOM (`preview_eval`): el screenshot se colgaba por la carga de imágenes full-res del bucket GCS remoto; la inspección del DOM es más precisa para criterios textuales. Resultados: anuro `incilius-valliceps` → Clase Amphibia, audio iNaturalist (`…iNat1999482, iNaturalist`), LHC, Residente, copy de anuros, 0 menciones a xeno-canto; salamandra `Pr` `bolitoglossa-platydactyla` → Amphibia, NOM-059 "Protección Especial", sin Vocalización; ave `actitis-macularius` (regresión) → Clase Aves, `…XC613665, xeno-canto.org`, copy de aves.
