/* FiltrosBar.tsx — filtros de la lista de voluntarios como links con query
   string (Server Component friendly: page.tsx lee `searchParams` y consulta
   Firestore ya filtrado — no es estado de cliente, ver design.md D7 sobre por
   qué el export de CSV también debe respetar estos mismos filtros). */
import Link from "next/link";
import type { FiltroContacto, FiltroSuscripcion } from "@/lib/voluntarios/types";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

function Chip({ activo, href, children }: { activo: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold ring-1 transition-colors ${FOCO} ${
        activo ? "bg-forest text-white ring-forest" : "bg-paper-card text-ink-soft ring-forest/15 hover:bg-mint-wash"
      }`}
    >
      {children}
    </Link>
  );
}

function conFiltro(actual: URLSearchParams, clave: string, valor: string): string {
  const params = new URLSearchParams(actual);
  params.set(clave, valor);
  return `/voluntarios?${params.toString()}`;
}

export function FiltrosBar({
  suscripcion,
  contacto,
}: {
  suscripcion: FiltroSuscripcion;
  contacto: FiltroContacto;
}) {
  const actual = new URLSearchParams({ suscripcion, contacto });

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Suscripción:</span>
      <Chip activo={suscripcion === "todos"} href={conFiltro(actual, "suscripcion", "todos")}>Todos</Chip>
      <Chip activo={suscripcion === "suscritos"} href={conFiltro(actual, "suscripcion", "suscritos")}>Suscritos</Chip>
      <Chip activo={suscripcion === "no-suscritos"} href={conFiltro(actual, "suscripcion", "no-suscritos")}>No suscritos</Chip>
      <span className="ml-4 mr-1 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Contacto:</span>
      <Chip activo={contacto === "todos"} href={conFiltro(actual, "contacto", "todos")}>Todos</Chip>
      <Chip activo={contacto === "contactados"} href={conFiltro(actual, "contacto", "contactados")}>Contactados</Chip>
      <Chip activo={contacto === "sin-contactar"} href={conFiltro(actual, "contacto", "sin-contactar")}>Sin contactar</Chip>
    </div>
  );
}
