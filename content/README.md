# content/

Contenido versionado del proyecto (Markdown/JSON). Fuente de verdad de todo lo editable sin tocar código. Ver [ADR-0004](../docs/decisions/0004-contenido-en-repo.md).

## Estructura prevista

```
content/
├── fauna/          fichas de especies (aves + anfibios/reptiles)
│   ├── aves/
│   └── anfibios/
├── noticias/       posts de comunidad.chirimoyo.org
├── comunidad/      historia, misión, visión, acciones
├── jornadas/       jornadas de limpieza/mantenimiento (voluntarios)
└── legal/          aviso de privacidad, datos de donación
```

> Cada esquema (campos de una ficha, de una noticia, de una jornada) se define en la issue/spec de su fase. No improvises el formato: revisa el spec correspondiente antes de añadir contenido.

## Aportar contenido sin programar

Si quieres aportar una ficha, foto o texto y no usas git, abre una issue con el material o escribe al correo de contacto. El equipo lo integra. Ver [CONTRIBUTING.md](../CONTRIBUTING.md).
