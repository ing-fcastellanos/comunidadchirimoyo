/* app/(authed)/dashboard/page.tsx — home del panel autenticado (#139/#140/#141).
   Nace en #139 como placeholder puro; #140 le agrega el primer acceso real
   (Noticias); #141 suma Jornadas.

   Nota de ruta: vive en /dashboard (no en `(authed)/page.tsx`, que colisionaría
   con el `app/page.tsx` público de #138 — los route groups no agregan segmento
   a la URL, así que ambos mapearían a "/"). Mismo destino que usa el proyecto
   hermano tras el login. */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
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

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/noticias"
          className="flex items-center gap-4 rounded-2xl bg-paper-card p-5 shadow-card ring-1 ring-forest/10 transition-colors hover:bg-mint-wash/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
            <Icon name="Newspaper" className="h-6 w-6" />
          </span>
          <span>
            <span className="block font-serif text-[18px] font-semibold text-forest-deep">Noticias</span>
            <span className="block text-[14px] text-ink-soft">Crear, editar y publicar noticias del sitio</span>
          </span>
        </Link>

        <Link
          href="/jornadas"
          className="flex items-center gap-4 rounded-2xl bg-paper-card p-5 shadow-card ring-1 ring-forest/10 transition-colors hover:bg-mint-wash/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
            <Icon name="CalendarDays" className="h-6 w-6" />
          </span>
          <span>
            <span className="block font-serif text-[18px] font-semibold text-forest-deep">Jornadas</span>
            <span className="block text-[14px] text-ink-soft">Gestionar jornadas recurrentes y eventos puntuales</span>
          </span>
        </Link>
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
