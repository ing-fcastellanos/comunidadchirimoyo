/* api.ts — configuración del API de backend (services/api). SOLO server-side:
   la URL base vive en la env `API_URL` y nunca se expone al navegador (no es
   NEXT_PUBLIC). El formulario de contacto la usa a través de un Server Action.
   Patrón reusable por futuros consumidores (p. ej. inscripción de voluntarios). */

/** Base del API. En local cae a localhost:8080 (Flask de services/api). */
function apiBase(): string {
  return (process.env.API_URL ?? "http://localhost:8080").replace(/\/+$/, "");
}

/** Endpoint de contacto: `${API_URL}/api/contacto`. */
export function contactoEndpoint(): string {
  return `${apiBase()}/api/contacto`;
}
