"use server";
/* actions.ts — server actions de candidatos (candidatos-admin). Redactar y
   descartar no tocan cookies de sesión ni hacen redirect() dependiente de
   ellas (mismo criterio de seguridad que noticias/jornadas actions.ts).
   Aprobar SÍ redirige (a un formulario existente o de vuelta al detalle),
   pero es navegación normal, no dependiente de la sesión.

   Todas requieren sesión válida: el gate de app/(authed)/layout.tsx ya impide
   llegar a estas páginas sin `__session` válida (capability auth-admin). */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FieldValue } from "firebase-admin/firestore";

import { getDb } from "../firestore";
import { getSession } from "../session";
import { getCandidatoAdmin } from "./read";
import { redactarConTono as redactarConTonoIA } from "./redaccion";
import { armarPrellenado } from "./prellenado";
import type { TonoNoticia } from "./types";

const COLECCION = "candidatos";

export interface CandidatoActionState {
  ok: boolean;
  error?: string;
  redaccion?: string;
}

async function exigirSesion(): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado: sesión inválida o ausente.");
}

/** Redacta el cuerpo de un candidato de tipo noticia en el tono elegido
    (llamada 2 de la IA, design.md D4/D6) y lo persiste en el candidato. */
export async function redactarConTono(candidatoId: string, tono: TonoNoticia): Promise<CandidatoActionState> {
  await exigirSesion();

  const candidato = await getCandidatoAdmin(candidatoId);
  if (!candidato) return { ok: false, error: "El candidato ya no existe." };
  if (candidato.tipo !== "noticia") {
    return { ok: false, error: "Solo los candidatos de tipo noticia admiten selección de tono." };
  }

  let redaccion: string;
  try {
    redaccion = await redactarConTonoIA(candidato.resumen, tono);
  } catch {
    return { ok: false, error: "No se pudo redactar con la IA. Intenta de nuevo." };
  }

  await getDb().collection(COLECCION).doc(candidatoId).update({ tono, redaccion });
  revalidatePath(`/candidatos/${candidatoId}`);

  return { ok: true, redaccion };
}

/** Marca un candidato como descartado, sin eliminarlo (queda como historial). */
export async function descartarCandidato(candidatoId: string): Promise<CandidatoActionState> {
  await exigirSesion();

  await getDb()
    .collection(COLECCION)
    .doc(candidatoId)
    .update({ estado: "descartado", revisadoEn: FieldValue.serverTimestamp() });

  revalidatePath("/candidatos");
  revalidatePath(`/candidatos/${candidatoId}`);

  return { ok: true };
}

/** Marca un candidato como aprobado. Para noticia/jornada/evento, redirige al
    formulario de creación existente con los campos prellenados (design.md
    D6) — no escribe directamente en noticias/jornadas. Para logro/aliado, no
    redirige: la propia página de detalle muestra el fragmento JSON copiable. */
export async function aprobarCandidato(candidatoId: string): Promise<CandidatoActionState> {
  await exigirSesion();

  const candidato = await getCandidatoAdmin(candidatoId);
  if (!candidato) return { ok: false, error: "El candidato ya no existe." };

  await getDb()
    .collection(COLECCION)
    .doc(candidatoId)
    .update({ estado: "aprobado", revisadoEn: FieldValue.serverTimestamp() });

  revalidatePath("/candidatos");
  revalidatePath(`/candidatos/${candidatoId}`);

  if (candidato.tipo === "logro" || candidato.tipo === "aliado") {
    return { ok: true };
  }

  redirect(armarPrellenado(candidato));
}
