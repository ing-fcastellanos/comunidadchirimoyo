/* opengraph-image.tsx — imagen OpenGraph generada por nota (#72). ImageResponse
   (next/og): un PNG 1200×630 por nota, generado en RUNTIME al solicitarse (Fase 6,
   #136; `force-dynamic`, sin pre-generar en build → el build no toca Firestore).
   Runtime Node (el sitio es standalone; NO edge). Satori no procesa Tailwind/CSS
   vars → estilos inline con colores hex de marca. Fuente por defecto de
   ImageResponse (la serif de marca es pulido futuro). */
import { ImageResponse } from "next/og";
import { getNoticiaCached } from "@/lib/noticias-cache";
import { formatearFecha } from "@/lib/noticias-paginacion";

export const dynamic = "force-dynamic";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Noticia de la Comunidad del Chirimoyo";

// Colores de marca (tokens.css) — Satori no entiende CSS vars.
const FOREST_DEEP = "#0c5a36";
const PINE_DEEP = "#052e1b";
const MINT = "#8ed8c0";
const PAPER = "#eef5ef";

function recortar(texto: string, max = 110): string {
  return texto.length > max ? `${texto.slice(0, max - 1).trimEnd()}…` : texto;
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const nota = await getNoticiaCached(slug);
  const titulo = nota ? recortar(nota.titulo) : "Comunidad del Chirimoyo";
  const fecha = nota?.fecha ? formatearFecha(nota.fecha) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundImage: `linear-gradient(135deg, ${PINE_DEEP} 0%, ${FOREST_DEEP} 100%)`,
          color: PAPER,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MINT,
            fontWeight: 700,
          }}
        >
          Comunidad Chirimoyo · Noticias
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.1,
            color: PAPER,
          }}
        >
          {titulo}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            color: MINT,
          }}
        >
          <span style={{ display: "flex" }}>{fecha}</span>
          <span style={{ display: "flex" }}>chirimoyo.org</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
