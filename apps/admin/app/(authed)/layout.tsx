/* app/(authed)/layout.tsx — gate real de sesión (#139, reemplaza el stub de
   #138). Server Component, `force-dynamic` (NUNCA cacheado): lee la cookie
   `__session` vía getSession() y redirige a /login si no hay sesión válida.
   Deliberadamente NO middleware — ver la nota histórica en session.ts /
   firebase-admin.ts sobre los quirks de Edge Runtime + Firebase Hosting
   rewrites que documentó sociedadsalvaje/apps/admin. */
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AuthedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/login");

  return <>{children}</>;
}
