/* app/api/notificar-voluntarios-semana/route.ts — trigger semanal del resumen
   de jornadas para voluntarios suscritos (#voluntarios-suscripcion-panel-admin).
   Cloud Scheduler llama este endpoint una vez por semana; calcula la agenda de
   los próximos 7 días reusando proximasJornadas() (ya existente, sin duplicar
   la lógica de fechas en Python — design.md D1) y reenvía a services/api, que
   ya sabe a quién avisar (suscritos) y cómo mandar el correo. Protegido por el
   mismo secreto compartido en ambos lados (NOTIFICAR_VOLUNTARIOS_SECRET),
   mismo patrón que app/api/revalidate/route.ts. Server-only. */
import { createHash, timingSafeEqual } from "node:crypto";

import { getJornadasDb } from "@/lib/jornadas-db";
import { proximasJornadas } from "@/lib/jornadas";

export const dynamic = "force-dynamic";

function secretosCoinciden(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function autorizado(req: Request): boolean {
  const secret = process.env.NOTIFICAR_VOLUNTARIOS_SECRET;
  if (!secret) return false; // fail-closed
  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  return provided.length > 0 && secretosCoinciden(provided, secret);
}

export async function POST(req: Request) {
  if (!autorizado(req)) {
    return Response.json({ ok: false, error: "no autorizado" }, { status: 401 });
  }

  const data = await getJornadasDb();
  const ocurrencias = proximasJornadas(data, new Date(), 7, 100);
  const agenda = ocurrencias.map((o) => ({
    titulo: o.titulo,
    tipo: o.tipo,
    fecha: o.fecha.toISOString(),
    lugar: o.lugar ?? null,
  }));

  const apiUrl = process.env.API_URL ?? "http://localhost:8080";
  const secret = process.env.NOTIFICAR_VOLUNTARIOS_SECRET as string;

  try {
    const resp = await fetch(`${apiUrl}/api/voluntarios/notificar-semana`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ agenda }),
    });
    const resultado = await resp.json().catch(() => null);
    return Response.json({ ok: resp.ok, agendaItems: agenda.length, resultado });
  } catch {
    return Response.json({ ok: false, error: "No se pudo contactar al API" }, { status: 502 });
  }
}
