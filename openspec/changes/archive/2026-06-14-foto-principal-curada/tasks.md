## 1. Script de migración

- [x] 1.1 Crear `scripts/aplicar-foto-principal.mjs` que lea `apps/catalogo/print/photo-selections.json` y, por slug, calcule el stem (sin extensión, `toLowerCase()`) del `archivo` curado.
- [x] 1.2 Por cada slug con selección, abrir `content/fauna/aves/<slug>/index.md`, parsear el frontmatter (parser/serializador YAML confiable) y localizar en `fotos[]` la entrada cuyo stem coincide.
- [x] 1.3 Si la entrada existe y no es la primera, moverla al frente de `fotos[]` y reescribir el archivo preservando el resto del frontmatter y el cuerpo Markdown intactos.
- [x] 1.4 Hacer el script idempotente (segunda corrida = sin cambios) e imprimir un reporte: reordenadas, ya-correctas, slug sin selección, slug cuya selección no casa con ninguna `fotos[]`.

## 2. Ejecutar y verificar la migración

- [x] 2.1 Correr el script en local y revisar el reporte (atender los casos "sin coincidencia").
- [x] 2.2 Revisar el `git diff`: confirmar que el único cambio por ficha es el orden del arreglo `fotos` (sin tocar otros campos ni el cuerpo).
- [x] 2.3 Verificar contra el PDF que la portada (`fotos[0]`) de una muestra de fichas coincide con la del PDF (p. ej. gallinago-delicata, botaurus-lentiginosus, himantopus-mexicanus).

## 3. Hero del landing sin hardcode

- [x] 3.1 Modificar `apps/catalogo/components/home/Hero.tsx` para derivar la imagen del hero de la portada curada (`fotos[0]`) de la especie representativa vía el data-layer, eliminando el archivo hardcodeado.
- [x] 3.2 Confirmar que el `alt` del hero sigue siendo descriptivo (de la foto o de la especie) y que el H1 sigue siendo único.

## 4. Verificación end-to-end

- [x] 4.1 `npm run typecheck` en `apps/catalogo` sin errores.
- [x] 4.2 `npm run build` + preview: miniaturas en `/busqueda` y hero de un detalle muestran la foto curada; el hero del landing carga la portada curada.
- [x] 4.3 Confirmar que `lib/search.ts` y `lib/ficha.ts` no requirieron cambios (siguen usando `fotos[0]`/orden).

## 5. Documentación y cierre

- [x] 5.1 Actualizar la guía `docs/guias/agregar-una-ave.md` si procede, mencionando que la primera foto es la portada curada y cómo re-correr el script tras recurar.
- [x] 5.2 Commit + PR con el reporte del script en la descripción.
