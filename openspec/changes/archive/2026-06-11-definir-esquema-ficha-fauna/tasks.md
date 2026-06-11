## 1. Validar el esquema contra la fuente real

- [x] 1.1 Revisar el CSV de origen y mapear columnas → campos del esquema (taxonomía, 3 ejes de estatus, conservación NOM-059/IUCN, gremio `categoria`, `genero`, `fuentes`, secciones de prosa)
- [x] 1.2 Resolver la Open Question de los ejes de estatus: **el CSV trae los 3 ejes como columnas separadas** y mapean 1:1 a los enums (incl. los 4 valores de `estatusMigratorio`)
- [x] 1.3 Agregar la fuente al repo: `content/fauna/_origen/aves-especies.csv` (46 esp., UTF-8) para visibilidad de #10–#13
- [x] 1.4 Especies de validación elegidas: **Garza Blanca** (residente, común, NOM-059 ninguno), **Avetoro Norteño** (migratoria de invierno, rara, NOM-059 Amenazada) y **Garza Ganadera** (residente, introducida) — cubren los 3 ejes y 2 niveles NOM-059

## 2. Extender los tipos en el loader del catálogo

- [x] 2.1 Añadir a `apps/catalogo/lib/content.ts` los tipos `Medidas`, `Temporada`, `Foto`, `Audio`, `Categoria` (gremio) y `SeccionFicha`
- [x] 2.2 Extender `FichaEspecie`: obligatorios `genero`, `fuentes: string[]`, `fotos: Foto[]`; opcionales `medidas`, `habitat`, `temporada`, `simbologia`, `audios`; `cuerpo` para el MD; sin cambiar la firma de `getAllFichas` (sigue stub)
- [x] 2.3 Documentar con comentarios la convención de slug, el significado de `categoria` (= gremio ecológico) y las secciones convenidas del cuerpo MD
- [x] 2.4 `npm run typecheck` en `apps/catalogo` pasa sin errores

## 3. Documentar el esquema en content/

- [x] 3.1 Añadida a `content/README.md` la sección "Esquema de la ficha de fauna": tablas de campos (obligatorios/opcionales), enums y tipos
- [x] 3.2 Documentado el formato y las secciones convenidas `##`
- [x] 3.3 Documentada la convención de slug y publicado el vocabulario sugerido de `habitat`
- [x] 3.4 Mapeo CSV→ficha y parseo de conservación documentados (`content/fauna/_origen/README.md`)
- [x] 3.5 Documentadas las reglas de medios (`fotos` con `credito`/`alt`/`licencia`, portada, rutas relativas; `audios` opcionales)

## 4. Ficha de ejemplo y validación

- [x] 4.1 Creada `content/fauna/aves/_ejemplo.md` (basada en Garza Blanca real) con frontmatter completo y secciones `##`
- [x] 4.2 Validado por script: el ejemplo cumple el esquema y las 3 especies (Garza Blanca, Avetoro Norteño, Garza Ganadera) mapean sin huecos
- [x] 4.3 La validación no reveló campos faltantes ni enums inadecuados; **contrato congelado**
