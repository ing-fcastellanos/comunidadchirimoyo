## MODIFIED Requirements

### Requirement: Página índice de búsqueda + resultados (estática)

La app del catálogo SHALL servir, en la ruta `/busqueda`, una pantalla integrada de
búsqueda y resultados generada estáticamente. En build SHALL cargar las fichas con
`getAllFichas()`, mapearlas a un view-model de búsqueda y embeber ese conjunto en la salida
estática. La pantalla NO SHALL llamar a ningún API ni endpoint de búsqueda (ADR-0005). La
ruta raíz `/` deja de servir esta pantalla; ahora sirve el landing (capacidad
`landing-catalogo`).

#### Scenario: Búsqueda estática con datos embebidos
- **WHEN** se ejecuta `npm run build` en `apps/catalogo`
- **THEN** la página estática de `/busqueda` (`out/busqueda.html` y su JS) contiene todas las especies del catálogo, sin requerir un servidor en runtime

#### Scenario: Sin backend de búsqueda
- **WHEN** se inspecciona la pantalla de búsqueda
- **THEN** todo el filtrado ocurre en el cliente sobre los datos del build; no hay llamadas de red a un API
