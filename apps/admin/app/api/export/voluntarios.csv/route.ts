/* app/api/export/voluntarios.csv/route.ts — export CSV de voluntarios,
   respetando los mismos filtros que la vista (design.md D7). NO incluye el
   texto de las notas de contacto — solo fecha del último contacto y total,
   para mantener el export al mínimo necesario (ADR-0012). */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAllVoluntariosAdmin } from "@/lib/voluntarios/read";
import type { FiltroContacto, FiltroSuscripcion } from "@/lib/voluntarios/types";

function comoFiltroSuscripcion(v: string | null): FiltroSuscripcion {
  return v === "suscritos" || v === "no-suscritos" ? v : "todos";
}

function comoFiltroContacto(v: string | null): FiltroContacto {
  return v === "contactados" || v === "sin-contactar" ? v : "todos";
}

/** Escapa un valor para una celda CSV (RFC 4180): comillas dobles si contiene
    coma, comilla o salto de línea. */
function celda(valor: string | number): string {
  const texto = String(valor);
  if (/[",\n]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const url = new URL(req.url);
  const suscripcion = comoFiltroSuscripcion(url.searchParams.get("suscripcion"));
  const contacto = comoFiltroContacto(url.searchParams.get("contacto"));

  const voluntarios = await getAllVoluntariosAdmin({ suscripcion, contacto });

  const encabezado = [
    "nombre", "correo", "telefono", "jornada", "acompanantes",
    "creado_en", "suscrito", "ultimo_contacto", "total_contactos",
  ];
  const filas = voluntarios.map((v) =>
    [
      v.nombre, v.correo, v.telefono, v.jornada, v.acompanantes,
      v.creadoEn, v.suscrito ? "si" : "no", v.ultimoContacto ?? "", v.totalContactos,
    ]
      .map(celda)
      .join(","),
  );

  const csv = [encabezado.join(","), ...filas].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="voluntarios.csv"`,
    },
  });
}
