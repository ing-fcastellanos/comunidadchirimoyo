/* session.ts — lectura/verificación de la sesión (#139). Centraliza el nombre
   de la cookie y la llamada a verifySessionCookie para que el gate del layout
   y cualquier página protegida usen la MISMA lógica. Server-only.

   El nombre `__session` es OBLIGATORIO: Firebase Hosting descarta cualquier
   otro nombre de cookie antes de proxiar el request a Cloud Run
   (https://firebase.google.com/docs/hosting/manage-cache#using_cookies). */
import { cookies } from "next/headers";
import { getAdminAuth } from "./firebase-admin";

export const SESSION_COOKIE = "__session";

export interface SessionInfo {
  uid: string;
  email: string | null;
}

/** Sesión actual o `null` si no hay cookie o no es válida/fue revocada.
    `checkRevoked: true` — equipo chico/tráfico bajo: vale el costo extra de
    latencia por poder forzar un logout inmediato (ver design.md D1).

    Nota (verificado en #139): `tokensValidAfterTime` tiene precisión de
    segundo — revocar en el MISMO segundo en que se creó la cookie puede no
    detectarse (empate de timestamp). Con cualquier separación real de tiempo
    (el caso real: alguien revoca el acceso de otra persona más tarde), la
    revocación sí se aplica de inmediato. No requiere mitigación: el empate
    solo ocurre en pruebas automatizadas muy rápidas, no en uso real. */
export async function getSession(): Promise<SessionInfo | null> {
  const store = await cookies();
  const sessionCookie = store.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}
