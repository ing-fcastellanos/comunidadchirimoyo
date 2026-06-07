# Contribuir

Gracias por tu interés en apoyar a la Comunidad Chirimoyo. Este es un proyecto comunitario y abierto; tanto código como contenido (fichas de aves, fotos, textos) son bienvenidos.

## Antes de empezar

1. Lee el [`README.md`](README.md) y el [`ROADMAP.md`](ROADMAP.md).
2. Revisa las [issues abiertas](../../issues) para no duplicar trabajo.
3. Para cambios grandes, abre primero una issue para discutir el enfoque.

## Flujo de trabajo

Todo requerimiento sigue el flujo OpenSpec del proyecto:

```
/opsx:explore → [v0.dev si hay UI con diseño nuevo] → /opsx:propose → /opsx:apply → /opsx:archive
```

Para contribuciones externas sin acceso a ese tooling, basta con:

1. Haz fork y crea una rama desde `main`: `feat/descripcion-corta`.
2. Haz tus cambios siguiendo las convenciones (ver [`CLAUDE.md`](CLAUDE.md)).
3. Asegúrate de que el CI pase (lint, typecheck, build).
4. Abre un PR usando la plantilla. Linkea la issue con `Closes #N`.

## Convenciones

- **Commits**: estilo conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.).
- **Branches**: nacen de `main` y se mantienen actualizadas.
- **Secretos**: jamás commitear `.env`, service accounts ni datos personales.
- **Contenido**: las fichas de aves y textos viven en `content/` como Markdown/JSON. Respeta el esquema existente.

## Aportar contenido sin programar

Si quieres aportar una ficha de ave, una foto o corregir un texto y no programas, abre una issue con el material adjunto o escríbenos al correo de contacto. Nosotros lo integramos.

## Código de conducta

Al participar aceptas el [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
