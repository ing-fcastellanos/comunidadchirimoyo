import { NextResponse, type NextRequest } from "next/server";

// Ruteo multi-subdominio por host (ADR-0008). Detrás de Firebase Hosting →
// Cloud Run, el host original llega en x-forwarded-host; en local/directo, en host.
//   comunidad.*   → /comunidad
//   voluntarios.* → /voluntarios
//   chirimoyo.org / www / *.run.app / localhost → landing (/)
export function middleware(request: NextRequest) {
  const host = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  ).toLowerCase();

  // includes (no startsWith) por si x-forwarded-host llega como lista "a, b".
  let prefix = "";
  if (host.includes("comunidad.")) prefix = "/comunidad";
  else if (host.includes("voluntarios.")) prefix = "/voluntarios";

  const { pathname } = request.nextUrl;
  if (prefix && !pathname.startsWith(prefix)) {
    const url = request.nextUrl.clone();
    url.pathname = `${prefix}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Excluye /_next, /api y archivos con extensión (favicon, imágenes, etc.).
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
