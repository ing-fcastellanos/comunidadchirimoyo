## 1. Contenido

- [x] 1.1 Crear `content/landing/privacidad.md` con frontmatter (`titulo`, `resumen`, `actualizado`, `estado: borrador`)
- [x] 1.2 Redactar las secciones `## H2` requeridas: Responsable, Qué datos recabamos, Para qué los usamos, Cómo los resguardamos, Tus derechos (ARCO), No compartimos tus datos, Cambios a este aviso
- [x] 1.3 Usar responsable colectivo "Comunidad Chirimoyo" y contacto `contacto@chirimoyo.org`; redactar el resguardo en coherencia con ADR-0012 (sin logs de PII, acceso restringido, sin cookies de rastreo)
- [x] 1.4 Documentar el archivo en `content/landing/README.md` (entrada para `privacidad.md`)

## 2. Lógica de lectura

- [x] 2.1 Añadir `getAviso()` en `apps/sitio/lib/landing.ts` reusando la mecánica de `getLucha` (gray-matter + split por `## H2`), exponiendo `titulo`, `actualizado`, `estado` y `secciones`
- [x] 2.2 Añadir la interfaz/tipo correspondiente junto a las demás de `landing.ts`

## 3. Página

- [x] 3.1 Crear `apps/sitio/app/privacidad/page.tsx` (Server Component async, molde de `/aliados`) con `metadata.title = "Aviso de privacidad"`
- [x] 3.2 Renderizar título, fecha de actualización y recorrido de secciones (texto plano por sección, opción A)
- [x] 3.3 Mostrar un aviso visible de "borrador pendiente de revisión" cuando `estado === "borrador"`

## 4. Verificación

- [x] 4.1 `/privacidad` responde 200 y muestra el aviso completo
- [x] 4.2 El enlace del Footer ("Aviso de privacidad") y el de la casilla de consentimiento del ContactoForm dejan de dar 404 y llegan a la página
- [x] 4.3 `npm run lint` y `npm run build` de `apps/sitio` pasan
