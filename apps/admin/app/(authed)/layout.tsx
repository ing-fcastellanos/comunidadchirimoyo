/* app/(authed)/layout.tsx — STUB (#138). Fija la forma de rutas para las
   páginas protegidas del panel (noticias, jornadas) SIN ningún gate de auth
   todavía: hoy solo renderiza `children`. El login llega en #139.

   Cuando #139 lo implemente, el gate DEBE vivir aquí (Server Component,
   `export const dynamic = "force-dynamic"`) y NO en middleware: Next 15 corre
   middleware en Edge Runtime, y detrás de un rewrite de Firebase Hosting a
   Cloud Run el proyecto hermano (sociedadsalvaje/apps/admin) encontró
   problemas de cacheo de redirects con ese enfoque. Además, si la sesión usa
   cookie, su nombre DEBE ser exactamente `__session` — Firebase Hosting
   descarta cualquier otro nombre de cookie antes de proxiar a Cloud Run
   (https://firebase.google.com/docs/hosting/manage-cache#using_cookies). */
export default function AuthedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
