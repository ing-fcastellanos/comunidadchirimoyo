/* links.ts — destinos externos centralizados del catálogo. Ajusta aquí la URL
   del sitio de la comunidad si el dominio final cambia. */

/** Sitio de la comunidad (relato, lucha, voluntarios). Vive fuera del catálogo,
   en otro origen/deploy (apps/sitio). Por eso es URL ABSOLUTA — una ruta relativa
   resolvería a fauna.chirimoyo.org/comunidad (404). Apunta al vanity, que hace
   301 al path canónico chirimoyo.org/comunidad (ADR-0023). */
export const COMUNIDAD_URL = "https://comunidad.chirimoyo.org";
