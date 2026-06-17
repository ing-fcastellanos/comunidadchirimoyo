## Context

`apps/sitio` es hoy 100% estático: el landing deriva todo de `content/landing/` y ningún componente llama al API. El "contacto" se ofrece como `mailto:`/`tel:` en el linktree y el footer. El backend `POST /api/contacto` ya existe (#46) y espera `{ nombre, correo, asunto, mensaje, consentimiento, website }`, con honeypot stateless y respuestas `201/200/400/5xx`.

El diseño del formulario viene de un handoff v0.dev (`Contacto.jsx`, preservado en `design-assets/`): Client Component autónomo con 4 estados, validación local accesible, honeypot `website` fuera de pantalla, y consentimiento que enlaza a `/privacidad`. El handoff simula el envío con `setTimeout`; aquí lo cableamos de verdad.

El patrón de porteo ya existe en el repo: `components/landing/Lightbox.tsx` muestra cómo se traduce un `.jsx` de v0 a TS con tokens (`mint`, `pine-deep`, `paper`), `Icon`, focus rings y accesibilidad hecha a mano.

## Goals / Non-Goals

**Goals:**
- Página `/contacto` accesible que envía al API y confirma al usuario.
- Ocultar la URL del API del browser (Server Action, env server-side).
- Validación cliente que espeja el backend; el Server Action revalida.
- Portear el diseño v0 fielmente a TS + tokens del proyecto.
- Establecer el patrón de plumbing del API reusable por voluntarios.

**Non-Goals:**
- Reimplementar la lógica del backend (es del API).
- Construir `/privacidad` (#56) — solo enlazar.
- Exponer la URL del API al cliente / usar `fetch` directo (B1 descartado).

## Decisions

### 1. Server Action como proxy (B2), no fetch directo (B1)
El formulario invoca un **Server Action** de Next; el server reenvía a `services/api`. Alternativa B1 (fetch del cliente con `NEXT_PUBLIC_API_URL` + CORS) se descartó: expone la URL del API y acopla a CORS. B2 mantiene `API_URL` server-side, elimina CORS del browser, permite revalidar en el servidor y degrada mejor. Como es el **primer** uso de API del sitio, este patrón queda como referencia para voluntarios.

```
  Client Component (/contacto)         Server (Next)            services/api
  ┌──────────────────────────┐    ┌──────────────────┐    ┌──────────────────┐
  │ form + 4 estados         │    │ Server Action    │    │ POST /api/contacto│
  │ validación espejo        │───▶│ revalida +       │───▶│ valida, persiste, │
  │ honeypot website         │    │ fetch a API_URL  │    │ notifica          │
  │ mapea resultado→UI       │◀───│ mapea 201/200/   │◀───│ 201/200/400/5xx   │
  └──────────────────────────┘    │ 400/5xx → result │    └──────────────────┘
                                   └──────────────────┘
                                    API_URL solo aquí (no NEXT_PUBLIC)
```

### 2. Contrato del Server Action: resultado discriminado, no excepciones
El Server Action devuelve un objeto serializable tipo `{ ok: true } | { ok: false, tipo: "validacion"|"servidor", errores?: {...} }`. El cliente mapea: API `201`→ok, `200`(honeypot)→ok (tratar como éxito), `400`→`validacion` con errores por campo, `5xx`/red→`servidor`. No se lanzan excepciones a través del boundary del action. Nunca se loguea PII en el server del sitio (coherente con ADR-0012).

### 3. Validación en dos capas (espejo + autoridad)
El cliente valida para UX inmediata (mismos límites que el backend: nombre ≤120, correo formato, asunto ≤160, mensaje ≤5000 + mínimo razonable, consentimiento=true). El **Server Action revalida** antes de llamar al API (un cliente puede saltarse JS). El API es la autoridad final. Las tres capas comparten las mismas reglas; se centralizan en un módulo para no divergir.

### 4. Honeypot manejado en cliente y reenviado
El campo `website` se mantiene del diseño (fuera de pantalla, `aria-hidden`, `tabindex=-1`, `autocomplete=off`). Si llega relleno, el cliente puede cortar en silencio, **y además** se reenvía al API para que el backend aplique su propia decisión (defensa redundante). El éxito aparente del API (`200`) se trata como éxito en la UI.

### 5. Porteo fiel del diseño v0 a TS + tokens
Se traduce `Contacto.jsx` a TS: `useState`/`useRef` tipados, clases con tokens del proyecto (ya usa `mint`, `forest`, `paper-card`, `ink`, etc. — coinciden con `tokens.css`), íconos propios del handoff (SVG inline) o el `Icon` compartido donde aplique. Se preserva el markup accesible (labels, `aria-describedby`, `role="alert"`, región `aria-live`, focus management). La página `app/contacto/page.tsx` aporta `metadata` y compone el Client Component.

### 6. Configuración del API server-side
Nueva env `API_URL` (base del API) leída solo en el server. `.env.example` la documenta; en prod se inyecta en el Cloud Run del sitio. Un helper en `lib/` centraliza la construcción del endpoint de contacto para reuso futuro (voluntarios).

## Risks / Trade-offs

- **[/privacidad no existe aún (#56)]** → El enlace del consentimiento apunta a `/contacto`… a `/privacidad`, que dará 404 hasta #56. Aceptado: decisión explícita de enlazar y seguir; #56 va después. El texto tranquilizador inline mitiga mientras tanto.
- **[Server Action añade un salto de red]** → Latencia extra mínima (Next y API en la misma región, `northamerica-south1`); se compensa con no exponer la URL ni lidiar con CORS. Mostrar estado `submitting` cubre la percepción.
- **[Divergencia de reglas de validación entre 3 capas]** → Mitigado centralizando las reglas en un módulo compartido en el sitio y manteniéndolas alineadas con las del API (#46); documentar el vínculo.
- **[Timeout/caída del API]** → El Server Action trata fallo de red/5xx como `{ ok:false, tipo:"servidor" }`; la UI muestra el alert genérico y permite reintentar. Sin reintentos automáticos.
- **[PII en transit / logs del sitio]** → El Server Action no loguea el cuerpo; solo reenvía. El API es quien persiste con consentimiento (ADR-0012).
