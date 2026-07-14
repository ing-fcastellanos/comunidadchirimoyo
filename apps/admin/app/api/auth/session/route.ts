/* app/api/auth/session/route.ts — intercambio de sesión (#139).
   Route Handler clásico — NUNCA una Server Action. El proyecto hermano
   (sociedadsalvaje/apps/admin, misma topología Next 15 + Firebase Hosting
   rewrite → Cloud Run) documenta que "Server Action + cookies().set() +
   redirect()" produce un LOOP DE REDIRECT a /login en esta topología (el
   siguiente request, vía RSC fetch con el header Next-Action, no procesa la
   cookie como una navegación nativa). Por eso: el form hace fetch() aquí, este
   handler responde JSON, y el cliente hace un reload completo
   (window.location.href), nunca router.push/redirect.

   POST: intercambia un idToken de Firebase (obtenido client-side con
   signInWithEmailAndPassword) por una cookie de sesión `__session`.
   DELETE: logout — limpia la cookie y revoca los refresh tokens del usuario. */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE } from "@/lib/session";

/** 5 días, en milisegundos (createSessionCookie) y segundos (cookie maxAge). */
const EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000;

/** Solo rutas relativas del mismo origen (#143, revisión de seguridad): un solo
    `/` inicial, nunca `//` ni `/\` — esas formas las interpretan los
    navegadores como URL absoluta a otro host (open redirect). Hoy ningún
    caller envía `redirectTo`; esto es defensa en profundidad para cuando se
    agregue un flujo de "volver a X tras iniciar sesión". */
function rutaSegura(valor: string | undefined): string {
  if (valor && /^\/(?!\/|\\)/.test(valor)) return valor;
  return "/dashboard";
}

export async function POST(req: Request) {
  let body: { idToken?: string; redirectTo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  const idToken = body.idToken;
  if (!idToken) {
    return NextResponse.json({ ok: false, error: "Falta el token de sesión." }, { status: 400 });
  }

  let sessionCookie: string;
  try {
    // Verifica el idToken antes de emitir la cookie (defensa en profundidad;
    // createSessionCookie ya lo valida internamente, pero un fallo aquí da un
    // mensaje más claro que dejar que ambas llamadas compitan).
    await getAdminAuth().verifyIdToken(idToken);
    sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn: EXPIRES_IN_MS });
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo iniciar sesión." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, redirectTo: rutaSegura(body.redirectTo) });
  response.cookies.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: EXPIRES_IN_MS / 1000,
  });
  return response;
}

export async function DELETE() {
  const store = await cookies();
  const sessionCookie = store.get(SESSION_COOKIE)?.value;

  if (sessionCookie) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(sessionCookie);
      await getAdminAuth().revokeRefreshTokens(decoded.uid);
    } catch {
      // Cookie ya inválida/expirada: no hay nada que revocar, se limpia igual.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
