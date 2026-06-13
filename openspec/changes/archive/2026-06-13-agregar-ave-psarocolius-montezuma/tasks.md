## 1. Investigación de datos (curación previa)

- [x] 1.1 Confirmar taxonomía y autoridad de *Psarocolius montezuma* (Passeriformes › Icteridae › Psarocolius; autoridad `(Lesson, 1830)`)
- [x] 1.2 Confirmar estatus de conservación de fuente abierta — **resultado: NOM-059 = Protección especial (Pr)**, IUCN = LC (confirmado por iNaturalist/CONABIO; difiere de wagleri)
- [x] 1.3 Determinar rango de distribución por país (ISO): SE de México → Panamá, **sin** Sudamérica; **SV excluido** (la especie está ausente de El Salvador)
- [x] 1.4 Registro local: el usuario confirma observación **constante** en el humedal (vive a una cuadra) → `gradoOcurrencia: comun`, `estatusMigratorio: residente`, notas en tono afirmativo
- [x] 1.5 Redactar la prosa de las secciones tomando la ficha de *wagleri* como molde y resaltando los rasgos propios (cabeza negra, carúncula azul, mejilla rosada, pico negro con punta naranja)

## 2. Fotos con licencia libre (repositorio público)

- [x] 2.1 Agregado `("Oropendola de Moctezuma","Psarocolius montezuma","Psarocolius montezuma")` a `ESPECIES[]` en `descargar_imagenes_faltantes.py`
- [x] 2.2 Descargadas 10 fotos CC a `Imagenes aves/Psarocolius montezuma/` (vía driver `_fetch_montezuma.py` que baja solo montezuma y **fusiona** en el manifiesto, sin re-descargar las 16 ni pisar las 503 entradas previas)
- [x] 2.3 `creditos_imagenes.json` con una entrada por foto (autor, licencia CC0/CC BY/CC BY-SA, `licencia_url`, `foto_pagina`); manifiesto respaldado antes del merge
- [x] 2.4 Revisadas: 10/10 abren, ~1024 px (mín. 602 px), todas claramente la especie y con licencia compatible — sin descartes

## 3. Audio de vocalización (xeno-canto)

- [x] 3.1 Buscada grabación (existe p. ej. XC827888) **pero** la API v2 de xeno-canto está caída (404) y las páginas bloquean scraping (anti-bot): **no se pudo verificar la licencia** de forma fiable
- [x] 3.2 Decisión: **omitir el bloque de audio** en esta pasada (campo opcional). Queda como pendiente para agregar luego con id + licencia verificados desde el navegador

## 4. Fila en el CSV de origen

- [x] 4.1 Fila clonada de *Psarocolius wagleri* como base (id 64)
- [x] 4.2 Ajustada identidad/taxonomía: `nombre_comun`, `nombre_cientifico`, `genero`, `autoridad (Lesson, 1830)`, `organizacion_taxonomica`, `otros_nombres`
- [x] 4.3 Ajustados estatus y `estatus_conservacion_detallado` = "Protección especial (NOM-059); Preocupación Menor (UICN)"
- [x] 4.4 Prosa pegada en las columnas de secciones; `claves_*`, `pull_quote`, `simbologia_recomendada` = "R-C-Pr-N"
- [x] 4.5 Búsqueda visual: `categoria: Terrestres`, `forma: pajaro`, `tamano: grande`, `colores`, `donde: arbol`, `habitat`, medidas (38-50 cm, 230-520 g), `fuentes`
- [x] 4.6 Columnas `sonido_*` vacías (audio omitido, ver §3)

## 5. Generar la ficha y subir media

- [x] 5.1 Corrido `migrar-fauna.py --upload` con CSV temporal de solo montezuma (para no reprocesar las 63 existentes); banco y manifiesto reales
- [x] 5.2 Reporte: ficha generada, **30 objetos subidos** (10 raw + 10 web + 10 thumb), 0 audios, sin errores de núcleo ni de atribución
- [x] 5.3 Creado `content/fauna/aves/psarocolius-montezuma/index.md` con `fotos[]` (10, créditos reales); sin `audios[]`. URL pública verificada (HTTP 200 image/webp)

## 6. Curación final de la ficha

- [x] 6.1 Añadido el bloque `distribucion` con ISO `["MX","BZ","GT","HN","NI","CR","PA"]` y `notas` honestas (SV ausente, no Sudamérica, límite altitudinal en Chirimoyo)
- [x] 6.2 `gradoOcurrencia: comun` / `estatusMigratorio: residente` reflejan el registro local del usuario
- [x] 6.3 Créditos revisados: 0 pendientes; las 2 fotos CC0 acreditadas a su autor (Juan J. Morales-Trejo)

## 7. Verificación y entrega

- [x] 7.1 `npm run build` OK — 69 páginas estáticas, ficha de montezuma validada, sin errores (solo un warning lint preexistente ajeno)
- [x] 7.2 Preview verificado: `/aves/psarocolius-montezuma` renderiza (h1 correcto, foto GCS carga a 1024px, mapa pinta las regiones, secciones completas, sin errores de consola)
- [x] 7.3 `/busqueda` lista 64 especies e incluye la Oropéndola de Moctezuma (texto + enlace presentes)
- [x] 7.4 Commit del contenido (ficha + fila CSV + artefactos archivados + spec sincronizado) y PR a main
