"use server";
/* actions.ts — server actions de escritura para el panel de voluntarios
   (voluntarios-suscripcion-panel-admin). Todas requieren sesión válida: el
   gate de app/(authed)/layout.tsx ya impide llegar sin `__session` válida
   (capability auth-admin). No tocan cookies de sesión ni hacen redirect()
   dependiente de ellas — mismo criterio de seguridad que noticias/jornadas. */
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";

import { getDb } from "../firestore";
import { getSession } from "../session";
import { getVoluntarioAdmin } from "./read";

const COLECCION = "voluntarios_inscripciones";

export interface ContactoActionState {
  ok: boolean;
  error?: string;
}

async function exigirSesion() {
  const session = await getSession();
  if (!session) throw new Error("No autorizado: sesión inválida o ausente.");
  return session;
}

/** Agrega una entrada al log de contactos de un voluntario. `quien` es el
    email de la sesión activa, no algo que el formulario pueda suplantar. */
export async function agregarContacto(
  voluntarioId: string,
  _prevState: ContactoActionState,
  formData: FormData,
): Promise<ContactoActionState> {
  const session = await exigirSesion();

  const nota = String(formData.get("nota") ?? "").trim();
  if (!nota) return { ok: false, error: "La nota no puede estar vacía." };

  const actual = await getVoluntarioAdmin(voluntarioId);
  if (!actual) return { ok: false, error: "El voluntario ya no existe." };

  await getDb().collection(COLECCION).doc(voluntarioId).collection("contactos").add({
    quien: session.email ?? session.uid,
    fecha: FieldValue.serverTimestamp(),
    nota,
  });

  revalidatePath(`/voluntarios/${voluntarioId}`);
  return { ok: true };
}

/** Alterna `suscrito` manualmente — para cuando alguien pide darse de baja
    (o de alta) sin usar el link del correo (design.md D6). */
export async function alternarSuscripcion(voluntarioId: string, nuevoValor: boolean): Promise<void> {
  await exigirSesion();

  const actual = await getVoluntarioAdmin(voluntarioId);
  if (!actual) throw new Error("El voluntario ya no existe.");

  await getDb().collection(COLECCION).doc(voluntarioId).update({ suscrito: nuevoValor });

  revalidatePath(`/voluntarios/${voluntarioId}`);
  revalidatePath("/voluntarios");
}
