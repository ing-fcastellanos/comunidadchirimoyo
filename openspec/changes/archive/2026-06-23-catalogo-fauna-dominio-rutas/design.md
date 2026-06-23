## Context

`apps/catalogo` es una app Next.js 15 (App Router) que compila a estático (`output: "export"`) y se sirve en `aves.chirimoyo.org`. Su arquitectura interna ya es multi-grupo: el contenido vive en `content/fauna/<grupo>/<slug>/index.md`, el loader `getAllFichas()` recorre `GRUPOS`, el detalle se genera en `/aves/[slug]`, y los buckets de imagen/audio usan el término "fauna". Solo el dominio y la información por path quedaron "aves-first":

- `/` → landing de aves (`app/page.tsx`: Hero carrusel, `avesCount`, secciones, CTAs a `/busqueda`).
- `/busqueda` → buscador de aves (`BuscadorAves`, filtros visuales ave-específicos).
- `/aves/[slug]` → ficha de detalle (`generateStaticParams` sobre todos los slugs).

**ADR-0024** (Accepted) decidió el dominio único `fauna.chirimoyo.org` con un path por grupo. Esta propuesta implementa esa IA y deja el andamiaje para que #85 (buscadores) y #88 (esquema group-aware + migración) construyan encima. El catálogo no está publicado, así que no hay URLs externas que preservar.

## Goals / Non-Goals

**Goals:**
- Hub de fauna en `/` con carrusel, tres tarjetas de grupo (aves activa; anfibios/reptiles "próximamente") y acceso a búsqueda.
- Mover el landing de aves a `/aves` y el buscador de aves a `/aves/buscador`, sin pérdida de funcionalidad.
- Generalizar la ruta de detalle a `app/[grupo]/[slug]`, preparada para cualquier grupo.
- Partir `grupo` en `aves | anfibios | reptiles` a nivel de tipo y loader (descubrimiento de carpetas), sin tocar campos del esquema.
- Renombrar la base pública a `fauna.chirimoyo.org` en el repo (metadata, SEO, sitemap, robots, target de Hosting) y neutralizar strings "aves" como nombre del catálogo completo.
- Stubs "próximamente" honestos para `/anfibios`, `/reptiles` y `/busqueda`.

**Non-Goals:**
- Campos group-aware del esquema (presencia, talla/criterio, actividad, sonido…) y migración de fichas de anfibios/reptiles → **#88**.
- Buscadores especializados por grupo y buscador general multi-grupo → **#85**.
- Cambios de infra fuera del repo (rename del site en Firebase, DNS en Porkbun, ejecución del 301) → manuales del responsable.

## Decisions

### D1 — Una sola jerarquía dinámica `app/[grupo]/…`, no carpetas estáticas por grupo

Toda la superficie de grupo cuelga de un segmento dinámico:

```
app/
├── page.tsx                 # / → hub de fauna (NUEVO)
├── [grupo]/
│   ├── page.tsx             # /aves, /anfibios, /reptiles  (índice del grupo)
│   ├── buscador/page.tsx    # /aves/buscador               (buscador del grupo)
│   └── [slug]/page.tsx      # /<grupo>/<slug>              (detalle)
└── busqueda/page.tsx        # /busqueda → stub "próximamente"
```

`[grupo]/page.tsx` ramifica por `grupo`: `aves` renderiza el landing rico actual (Hero, QueHayAqui, ElHumedal, CierreCTA); `anfibios`/`reptiles` renderizan el placeholder "próximamente". `[grupo]/buscador/page.tsx`: `aves` monta `BuscadorAves`; otros grupos → `notFound()` (su buscador es #85). `generateStaticParams` acota los grupos válidos (`["aves","anfibios","reptiles"]`) y, para `[slug]`, genera solo pares grupo×slug existentes con `dynamicParams = false`.

- **Por qué:** un solo patrón escala a insectos/mamíferos sin duplicar carpetas, y materializa "ruta generalizada" de ADR-0024. La ramificación por grupo es un `switch` localizado, barato hoy (solo aves es rico).
- **Alternativa descartada:** `app/aves/` estática + `app/[grupo]/` dinámica como hermanas. Next permite la convivencia (estático gana), pero obliga a duplicar el detalle (`app/aves/[slug]` y `app/[grupo]/[slug]`) o a mezclar dos patrones. Más frágil y peor para los grupos futuros.

### D2 — Resolución `/aves/buscador` vs `/aves/[slug]`

`buscador` es un segmento estático hermano de `[slug]`; en Next el segmento estático gana sobre el dinámico, así que `/aves/buscador` resuelve al buscador y nunca colisiona con una ficha. Se añade una guarda: ningún `slug` de especie puede ser `buscador` (improbable con slugs binomiales, pero se valida en build).

### D3 — `/busqueda` como stub, no como redirect

Al liberarse `/busqueda` (el buscador de aves se va a `/aves/buscador`), se deja como página stub "próximamente" en lugar de redirigir o eliminar. El hub y el `Header` global enlazan ahí. Cuando #85 construya el buscador general, reemplaza el stub in situ sin cambiar enlaces.

- **Por qué:** consistente con la narrativa "próximamente" de las tarjetas de grupo; evita que el `Header` cambie de destino dos veces; mantiene la URL canónica reservada para su inquilino definitivo.

### D4 — Split de `grupo` solo en tipo + loader

`type Grupo = "aves" | "anfibios" | "reptiles"` en `lib/fauna-schema.ts` y `GRUPOS = ["aves","anfibios","reptiles"]` en `lib/content.ts`. El loader ya tolera grupos cuyas carpetas no existen (`continue` en el `readdir` fallido), así que añadir `anfibios`/`reptiles` sin contenido no rompe el build. Los **campos** del esquema (validador del núcleo, frontmatter) no cambian: eso es #88.

- **Por qué:** las rutas y stubs necesitan que el tipo admita los tres grupos; los campos no son necesarios hasta que haya datos. Mantener el corte estrecho evita acoplar este cambio con #88.
- **Nota:** la spec `esquema-ficha-fauna` se actualiza solo en el enum de `grupo` y el `<grupo>` de la ruta de contenido; el resto del esquema queda intacto.

### D5 — Base pública parametrizada por entorno

El rename a `fauna.chirimoyo.org` se centraliza en `metadataBase`/constantes de base URL y en las variables ya existentes (`NEXT_PUBLIC_FAUNA_CDN_BASE` sigue apuntando al bucket actual `catalogo-aves-chirimoyo`: el bucket **no** se renombra en este cambio, solo el dominio web). Sitemap y robots se regeneran con la nueva base. El target del site de Firebase Hosting se renombra en `.firebaserc`/`firebase.json` (el cambio de archivo es del repo; aplicar el rename en la consola/DNS es manual).

### D6 — Neutralizar strings "aves" como nombre del catálogo

`Header` ("Guía de Aves · Orizaba"), títulos y metadata que nombran el catálogo completo como "aves" pasan a "fauna"/"Guía de Fauna" o equivalente neutral, dejando "aves" solo donde se refiere al grupo. Strings preparados para i18n (ADR-0011): no se hardcodean de forma que impidan traducir.

## Risks / Trade-offs

- **[Enlaces internos rotos tras mover rutas]** → Inventario cerrado de enlaces a `/busqueda` (`Header` ×2, `Hero`, `CierreCTA`) y a `/aves/${slug}` (`search.ts`, `secciones.tsx`); se repuntan todos y se verifica con `npm run build` (export estático falla si una ruta referenciada no existe) + revisión en preview.
- **[Doble carrusel hub + /aves]** → Tanto el hub como el landing movido muestran carrusel de aves; es redundancia aceptada y deseada por ahora. Se reutiliza el componente `Hero` para no duplicar lógica.
- **[`grupo` en el view-model de búsqueda]** → `fichaToBird` compone `href: /aves/${slug}` hardcodeado; al generalizar a `/${grupo}/${slug}` debe leer `f.grupo`. Riesgo bajo: el campo ya existe en `FichaEspecie`.
- **[Confusión enum `anfibios-reptiles` → `anfibios`/`reptiles`]** → No hay contenido con grupo `anfibios-reptiles` aún (la carpeta no existe), así que el split no invalida fichas existentes; las de aves no se tocan.
- **[Stub percibido como bug]** → Las páginas "próximamente" deben comunicar estado intencional (copy claro), no parecer error 404 ni página vacía.

## Migration Plan

1. Split de tipo/loader (`Grupo`, `GRUPOS`) — base para todo lo demás.
2. Generalizar detalle a `app/[grupo]/[slug]` y repuntar `href` en `search.ts`/`secciones.tsx`.
3. Mover landing a `app/[grupo]/page.tsx` (rama aves) y buscador a `app/[grupo]/buscador/page.tsx`.
4. Construir hub en `app/page.tsx` + stubs (`/anfibios`, `/reptiles`, `/busqueda`).
5. Rename de dominio: `metadataBase`, SEO, sitemap, robots, `.firebaserc`/`firebase.json`, strings "aves".
6. Verificar `npm run typecheck` + `npm run build` + preview de las rutas nuevas.
7. (Manual, fuera del repo) rename del site en Firebase, DNS Porkbun, vanity 301.

**Rollback:** el cambio es de rutas/estáticos sin estado persistente; revertir el PR restaura las rutas previas. Como el catálogo no está publicado, no hay tráfico externo en riesgo.

## Open Questions

- Ninguna bloqueante. El copy exacto de las tarjetas "próximamente" y del hub se resuelve en implementación contra el sistema de diseño existente.
