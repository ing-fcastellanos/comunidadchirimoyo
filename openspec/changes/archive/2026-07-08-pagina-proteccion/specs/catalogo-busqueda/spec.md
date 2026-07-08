## ADDED Requirements

### Requirement: Filtro inicial de conservación desde la URL

El buscador general (`/busqueda`) SHALL aceptar un parámetro de consulta opcional `conservaciones` (p. ej. `?conservaciones=NOM-059`) y, si está presente al montar, SHALL inicializar el filtro de conservación con ese valor en lugar de arrancar en `EMPTY_FILTERS`. Esto permite que otras páginas del catálogo (p. ej. `/proteccion`) enlacen directamente a una vista ya filtrada. Cuando el parámetro está ausente, el comportamiento SHALL ser idéntico al actual (filtros vacíos).

#### Scenario: Llega con el parámetro de conservación
- **WHEN** se abre `/busqueda?conservaciones=NOM-059`
- **THEN** el filtro de conservación NOM-059 queda activo de inmediato y los resultados solo muestran especies con esa categoría

#### Scenario: Llega sin parámetros
- **WHEN** se abre `/busqueda` sin parámetros de consulta
- **THEN** los filtros arrancan vacíos, igual que antes de este cambio
