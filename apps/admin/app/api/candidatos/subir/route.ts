/* app/api/candidatos/subir/route.ts — sube un export de WhatsApp y dispara la
   extracción de candidatos (candidatos-admin, design.md D1). Route Handler
   (no Server Action), mismo criterio que app/api/noticias/[slug]/portada/
   route.ts: evita el límite de 1MB de Server Actions. El archivo se lee a
   memoria, se parsea y se descarta al terminar el request — NUNCA se
   persiste (D4 del proposal/design, espíritu ADR-0012). */
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { getDb } from "@/lib/firestore";
import { getSession } from "@/lib/session";
import { getGrupo } from "@/lib/candidatos/types";
import { getUltimoCorte, actualizarUltimoCorte } from "@/lib/candidatos/grupos";
import { parsearExportWhatsapp, filtrarPosterioresA, dividirEnLotes } from "@/lib/candidatos/whatsapp-parser";
import { extraerCandidatos } from "@/lib/candidatos/extraccion";
import { OpenAINoConfiguradoError, resumenErrorSeguro } from "@/lib/candidatos/openai-client";

const COLECCION = "candidatos";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const formData = await req.formData();
  const grupoId = String(formData.get("grupoId") ?? "");
  const grupo = getGrupo(grupoId);
  if (!grupo) {
    return NextResponse.json({ error: "Selecciona un grupo válido." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".txt")) {
    return NextResponse.json({ error: "El export debe ser un archivo .txt." }, { status: 400 });
  }

  // Se lee a string y se descarta con el request: nunca se escribe a disco,
  // GCS ni Firestore (D4 — solo persisten los candidatos ya extraídos).
  const contenido = await file.text();
  const todos = parsearExportWhatsapp(contenido);
  const corte = await getUltimoCorte(grupo.id);
  const nuevos = filtrarPosterioresA(todos, corte);

  if (nuevos.length === 0) {
    return NextResponse.json({ creados: 0, restantes: 0, mensaje: "No hay mensajes nuevos desde el último corte de este grupo." });
  }

  // Un export puede traer meses de historial (sobre todo la primera subida
  // de un grupo, cuando el corte todavía es null) — se procesa de a un lote
  // acotado por request para no exceder el contexto/tiempo de una sola
  // llamada a la IA. El cliente (SubirExportForm) reintenta automáticamente
  // con el mismo archivo hasta que `restantes` llega a 0.
  const [lote, ...resto] = dividirEnLotes(nuevos);
  const restantes = resto.reduce((acc, l) => acc + l.length, 0);

  let extraidos;
  try {
    extraidos = await extraerCandidatos(lote);
  } catch (err) {
    if (err instanceof OpenAINoConfiguradoError) {
      return NextResponse.json({ error: "La IA no está configurada (falta OPENAI_API_KEY)." }, { status: 500 });
    }
    // Nunca se loguea el error crudo (puede traer la API key en el mensaje
    // si el header Authorization quedó mal formado, como pasó en producción)
    // ni contenido del chat — solo un resumen ya redactado (resumenErrorSeguro).
    console.error("candidatos/subir: fallo al extraer candidatos —", resumenErrorSeguro(err));
    return NextResponse.json({ error: "No se pudo analizar el chat con la IA. Intenta de nuevo." }, { status: 502 });
  }

  const db = getDb();
  const batch = db.batch();
  for (const c of extraidos) {
    const ref = db.collection(COLECCION).doc();
    batch.set(ref, {
      grupoId: grupo.id,
      grupoNombre: grupo.nombre,
      tipo: c.tipo,
      resumen: c.resumen,
      fechaMensaje: c.fechaMensaje,
      confianza: c.confianza,
      estado: "pendiente",
      tono: null,
      redaccion: null,
      creadoEn: FieldValue.serverTimestamp(),
      revisadoEn: null,
    });
  }
  if (extraidos.length > 0) await batch.commit();

  // El corte avanza en cuanto se analiza el LOTE (no todo `nuevos`), haya o
  // no candidatos publicables en él — así una subida repetida no vuelve a
  // enviar estos mismos mensajes a la IA, y el progreso sobrevive si un lote
  // posterior falla.
  const ultimoMensaje = lote[lote.length - 1];
  await actualizarUltimoCorte(grupo.id, ultimoMensaje.fecha);

  return NextResponse.json({ creados: extraidos.length, restantes });
}
