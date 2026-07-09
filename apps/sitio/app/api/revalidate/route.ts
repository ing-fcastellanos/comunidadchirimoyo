/* app/api/revalidate/route.ts — revalidación on-demand del contenido dinámico
   (Fase 6, #136). El admin lo llama al publicar una nota para que el sitio la
   muestre sin re-desplegar (#140). POST únicamente, protegido por un secreto
   compartido `REVALIDATE_SECRET` (server-only, NUNCA NEXT_PUBLIC). Invalida el
   tag `noticias`, que cubre listado, paginación, detalle y sitemap (todos leen
   por lib/noticias-cache). Server-only. */
import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

import { NOTICIAS_TAG } from "@/lib/noticias-cache";

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

export async function POST(req: Request) {
  if (!autorizado(req)) {
    return Response.json({ revalidated: false, error: "no autorizado" }, { status: 401 });
  }
  revalidateTag(NOTICIAS_TAG);
  return Response.json({ revalidated: true, tag: NOTICIAS_TAG });
}
