/* revalidar.ts — llamada best-effort a POST /api/revalidate de apps/sitio
   (#140, design.md D5/D6). Se invoca cuando una escritura afecta contenido que
   ES o FUE público (`estado` publicado en algún momento de la transición). Un
   fallo (red, secreto desincronizado, sitio caído) NUNCA lanza: la escritura
   en Firestore ya se completó y es la fuente de verdad; el respaldo horario
   (`revalidate: 3600` en noticias-cache.ts de sitio) alcanza el resto. */

export interface RevalidarResultado {
  ok: boolean;
  error?: string;
}

/** Revalida el tag "noticias" en apps/sitio. No lanza si falla. */
export async function revalidarNoticias(): Promise<RevalidarResultado> {
  const base = process.env.SITIO_BASE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!base || !secret) {
    return { ok: false, error: "SITIO_BASE_URL o REVALIDATE_SECRET no configurados." };
  }

  try {
    const resp = await fetch(`${base}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ tag: "noticias" }),
    });
    if (!resp.ok) {
      return { ok: false, error: `El sitio respondió ${resp.status}.` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo contactar al sitio para revalidar." };
  }
}
