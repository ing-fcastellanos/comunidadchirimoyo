/* app/api/noticias/[slug]/portada/route.ts — sube la imagen de portada de una
   noticia (#142). Route Handler (NO Server Action, D1 del design): evita el
   límite de 1MB de Server Actions y no requiere CORS en el bucket (a
   diferencia de un signed URL). Solo sube el archivo — NO escribe en
   Firestore (D9); el cliente usa la ruta devuelta para completar el campo
   `portada` del formulario, que se persiste al guardar (actualizarNoticia). */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { existeNoticia } from "@/lib/noticias/read";
import { validarArchivoPortada } from "@/lib/portada/validation";
import { subirPortada } from "@/lib/portada/subir";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { slug } = await params;
  if (!(await existeNoticia(slug))) {
    return NextResponse.json({ error: "La noticia no existe." }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }

  const { ok, error, extension } = validarArchivoPortada(file);
  if (!ok || !extension) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = await subirPortada(slug, extension, file.type, buffer);

  return NextResponse.json({ path });
}
