## Context

La página de detalle (`app/[grupo]/[slug]/page.tsx`) compone secciones server-only desde `components/ficha/secciones.tsx`, con view-models en `lib/ficha.ts` y etiquetas en `lib/dictionary.ts`. La ruta ya es group-aware (`/<grupo>/<slug>`) y el esquema/loader también (#87), pero el **render** conserva literales de cuando el catálogo era solo de aves. La verificación de #92 los expone:

| Bird-ism | Archivo | Gravedad |
|---|---|---|
| `["Clase", "Aves"]` fijo | `secciones.tsx` TaxonomiaSec | factual |
| crédito `…, xeno-canto.org` fijo | `ficha.ts` audiosVista | atribución |
| copy "Las aves usan la voz… xeno-canto" | `secciones.tsx` VocalizacionSec | voz |
| `Icon name="Bird"` ×2 | `secciones.tsx` Hero + Relacionadas | ícono |

Datos relevantes: las **7** grabaciones de herpetofauna son todas de iNaturalist (`fuenteId: iNat…`, host `inaturalist.org`); las aves usan xeno-canto (`fuenteId: XC…`). No hay reptiles con audio.

## Goals / Non-Goals

**Goals:**
- Eliminar los 4 bird-isms del detalle derivando todo del `grupo`/dato, con **comportamiento idéntico para aves**.
- Corregir la atribución de audio para que refleje la **fuente real** de la grabación.
- Mantener el detalle 100% estático (sin JS de cliente nuevo, ADR-0014) y i18n-ready (ADR-0011).

**Non-Goals:**
- Rediseño visual o diseño v0.dev nuevo.
- Cambios de esquema, datos o de otras vistas (buscador, hub, índice).

## Decisions

### Decisión 1 — Tablas por grupo en `dictionary.ts`, no condicionales en JSX

Centralizar los valores group-aware como diccionarios (`Record<Grupo, …>`) junto a los ya existentes (`MIGRATORIO_LABEL`, etc.), no como `if grupo === …` dispersos en los componentes:

```ts
export const CLASE_LABEL: Record<Grupo, string> =
  { aves: "Aves", anfibios: "Amphibia", reptiles: "Reptilia" };
export const GRUPO_ICON: Record<Grupo, IconName> =
  { aves: "Bird", anfibios: "Droplet", reptiles: "Turtle" };
```

`TaxonomiaSec` usa `CLASE_LABEL[ficha.grupo]`; `HeroFicha` y `RelacionadasNav` usan `GRUPO_ICON[ficha.grupo]`. Patrón consistente con el resto del módulo y trivial de extender a `insectos`/`mamiferos`.

**Clase = nombre científico latino** (`Amphibia`/`Reptilia`/`Aves`) por coherencia con el resto de la tabla taxonómica (Reino `Animalia`, Filo `Chordata`), que ya usa latín.

### Decisión 2 — Fuente del audio derivada del `fuenteId`, con `creditoUrl` como respaldo

`audiosVista` deja de concatenar `"xeno-canto.org"` fijo. Un helper puro mapea el **prefijo de `fuenteId`** a la fuente:

```
XC…   → { nombre: "xeno-canto",  dominio: "xeno-canto.org" }
iNat… → { nombre: "iNaturalist", dominio: "iNaturalist" }
```

El crédito compuesto pasa a `"<credito>, <fuenteId>, <dominio-fuente>"`. Si el prefijo no casa (futuras fuentes), se cae al **host de `creditoUrl`** y, en último caso, se omite el segmento de fuente (el `credito` y `creditoUrl` ya portan la atribución). Se prefiere `fuenteId` como señal primaria porque es el identificador canónico y ambas grabaciones lo traen; `creditoUrl` es el respaldo robusto.

### Decisión 3 — Copy de vocalización group-aware + fuente nombrada

`VocalizacionSec` recibe el `grupo` (o se le pasa la ficha) y elige el párrafo descriptivo:

- **aves:** "Las aves usan la voz para cortejar, defender su territorio y mantenerse en contacto."
- **anfibios:** "Las ranas y sapos cantan sobre todo para atraer pareja y delimitar territorio, especialmente tras la lluvia."
- **fallback (reptiles/otros):** texto genérico sin afirmar conducta específica.

La frase de procedencia nombra la **fuente real** derivada del audio (Decisión 2) en vez de "xeno-canto" fijo. El título existente (`Su canto`/`Su llamado`/`Su voz`) ya es group-neutral y se conserva.

### Decisión 4 — Ícono de anfibios: `Droplet` (lucide no tiene rana)

lucide-react no tiene ícono de anfibio. Se elige `Droplet` por la asociación con el hábitat acuático/húmedo; `Turtle` cubre reptiles (aunque sesgado a tortugas, es el más cercano del set) y `Bird` se mantiene para aves. Es decorativo (`aria-hidden`), así que la aproximación no afecta accesibilidad. Si en el futuro se quiere granularidad por `categoria` (serpientes vs. tortugas), se hará sobre esta misma tabla.

## Risks / Trade-offs

- **[Regresión silenciosa en aves]** → Todas las sustituciones preservan el valor de aves (`CLASE_LABEL.aves="Aves"`, `XC…`→`xeno-canto.org`, copy de aves textual, `Bird`). Verificación: abrir una ficha de ave antes/después y confirmar identidad.
- **[Una fuente de audio futura sin mapear]** → El respaldo a `creditoUrl` host y la omisión del segmento evitan atribuciones inventadas; nunca se vuelve a hardcodear una fuente.
- **[`Droplet` como ícono de anfibios es aproximado]** → Aceptado; decorativo y centralizado para cambiarlo en un punto.
- **[Spec con fórmula obsoleta]** → Se modifica el requisito "Atribución de la vocalización" de `catalogo-detalle` en el mismo cambio (la fórmula fija `xeno-canto.org` era la fuente del bug).

## Open Questions

- Ninguna que bloquee. (El set exacto de prefijos de fuente se limita hoy a `XC`/`iNat`; ampliarlo es una entrada en el mapa.)
