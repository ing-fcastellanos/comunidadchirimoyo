/* app/api/revalidate/route.ts — revalidación on-demand del contenido dinámico
   (Fase 6, #136/#137). El admin lo llama al publicar una nota o jornada para que
   el sitio la muestre sin re-desplegar (#140/#141). POST únicamente, protegido
   por un secreto compartido `REVALIDATE_SECRET` (server-only, NUNCA
   NEXT_PUBLIC). Por defecto revalida AMBOS tags (`noticias` + `jornadas`, que
   cubren noticias/sitemap y /voluntarios respectivamente); acepta un `tag`
   opcional en el body para targetear solo uno. Server-only. */
import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

import { NOTICIAS_TAG } from "@/lib/noticias-cache";
import { JORNADAS_TAG } from "@/lib/jornadas-cache";

const TAGS_VALIDOS = [NOTICIAS_TAG, JORNADAS_TAG] as const;
type TagValido = (typeof TAGS_VALIDOS)[number];

export const dynamic = "force-dynamic";

/** Comparación en tiempo constante sobre el hash (longitud fija, sin fuga por
    longitud del secreto). */
function secretosCoinciden(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Toma el secreto del header `Authorization: Bearer <secreto>` (no en la URL). */
function autorizado(req: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return false; // fail-closed: sin secreto configurado, no se revalida
  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  return provided.length > 0 && secretosCoinciden(provided, secret);
}

/** Lee `{ tag? }` del body si viene (JSON); tolera body vacío o ausente. */
async function tagSolicitado(req: Request): Promise<TagValido | null> {
  try {
    const body = (await req.json()) as { tag?: unknown };
    const tag = typeof body?.tag === "string" ? body.tag : null;
    return tag && (TAGS_VALIDOS as readonly string[]).includes(tag) ? (tag as TagValido) : null;
  } catch {
    return null; // sin body / no-JSON → revalida todo (default)
  }
}

export async function POST(req: Request) {
  if (!autorizado(req)) {
    return Response.json({ revalidated: false, error: "no autorizado" }, { status: 401 });
  }
  const tag = await tagSolicitado(req);
  const tags = tag ? [tag] : [...TAGS_VALIDOS];
  tags.forEach((t) => revalidateTag(t));
  return Response.json({ revalidated: true, tags });
}
