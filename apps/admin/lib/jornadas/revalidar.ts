/* revalidar.ts — llamada best-effort a POST /api/revalidate de apps/sitio
   (#141, design.md D12). Espejo de apps/admin/lib/noticias/revalidar.ts,
   duplicado deliberadamente (no se abstrae en un helper genérico) para seguir
   la convención de archivos espejo por capability que ya usa apps/sitio
   (noticias-cache.ts / jornadas-cache.ts). A diferencia de noticias, aquí se
   invoca incondicionalmente en cada escritura (D3: sin estado, toda jornada
   es siempre pública). Un fallo nunca lanza: la escritura en Firestore ya se
   completó y es la fuente de verdad. */

export interface RevalidarResultado {
  ok: boolean;
  error?: string;
}

/** Revalida el tag "jornadas" en apps/sitio. No lanza si falla. */
export async function revalidarJornadas(): Promise<RevalidarResultado> {
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
      body: JSON.stringify({ tag: "jornadas" }),
    });
    if (!resp.ok) {
      return { ok: false, error: `El sitio respondió ${resp.status}.` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo contactar al sitio para revalidar." };
  }
}
