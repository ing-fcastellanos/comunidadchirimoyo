/* app/(authed)/dashboard/page.tsx — placeholder autenticado (#139). Único
   propósito: demostrar el flujo de punta a punta (login → gate → esta página
   → logout) antes de que #140/#141 lo reemplacen por el dashboard real con
   las secciones de noticias/jornadas.

   Nota de ruta: vive en /dashboard (no en `(authed)/page.tsx`, que colisionaría
   con el `app/page.tsx` público de #138 — los route groups no agregan segmento
   a la URL, así que ambos mapearían a "/"). Mismo destino que usa el proyecto
   hermano tras el login. */
import { getSession } from "@/lib/session";
import { LogoutButton } from "../logout-button";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-[28px] font-semibold text-forest-deep">
        Sesión activa
      </h1>
      <p className="mt-2 text-[15px] text-ink/75">
        {session?.email ?? "Sesión verificada"}
      </p>
      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
