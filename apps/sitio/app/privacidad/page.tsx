/* /privacidad — aviso de privacidad del proyecto. Página estática (Server
   Component, sin API), única fuente de verdad enlazada desde el Footer y la
   casilla de consentimiento del formulario de contacto, y a futuro desde el
   formulario de voluntariado (#56, ADR-0012). El texto vive en
   content/landing/privacidad.md; aquí solo se renderiza. */
import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { getAviso } from "@/lib/landing";

export const metadata = {
  title: "Aviso de privacidad",
  description:
    "Cómo Comunidad Chirimoyo trata los datos personales que le compartes y los derechos que tienes sobre ellos.",
  alternates: { canonical: "/privacidad" },
};

/** Convierte texto con **negritas** de markdown en nodos React, sin HTML crudo. */
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) => {
    const m = chunk.match(/^\*\*([^*]+)\*\*$/);
    return m ? (
      <strong key={i} className="font-semibold text-forest-deep">
        {m[1]}
      </strong>
    ) : (
      <span key={i}>{chunk}</span>
    );
  });
}

function fechaLarga(iso: string | null): string | null {
  if (!iso) return null;
  // Parseamos YYYY-MM-DD como fecha local (no UTC) para evitar el off-by-one
  // que daría new Date("2026-06-17") en zonas horarias detrás de UTC.
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PrivacidadPage() {
  const { titulo, resumen, actualizado, estado, secciones } = await getAviso();
  const fecha = fechaLarga(actualizado);

  return (
    <Section className="py-16 sm:py-24">
      <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest-deep">
        Legal · chirimoyo.org
      </div>
      <h1 className="mt-3 font-serif text-[clamp(36px,6vw,64px)] font-semibold leading-[0.98] text-forest-deep text-balance">
        {titulo}
      </h1>
      {resumen && (
        <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-ink/80 text-pretty">
          {resumen}
        </p>
      )}
      {fecha && (
        <p className="mt-3 text-[14px] text-ink-soft">
          Última actualización: {fecha}
        </p>
      )}

      {estado === "borrador" && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl bg-mint-wash px-5 py-4 text-[15px] leading-relaxed text-pine-deep ring-1 ring-forest/10">
          <Icon name="Info" className="mt-0.5 h-5 w-5 shrink-0 text-forest/70" />
          <p className="text-pretty">
            Este aviso es un <strong className="font-semibold">borrador</strong>{" "}
            pendiente de revisión y aún no es un texto definitivo. Si tienes
            dudas, escríbenos a contacto@chirimoyo.org.
          </p>
        </div>
      )}

      <div className="mt-12 max-w-2xl space-y-9">
        {secciones.map((s) => (
          <div key={s.titulo}>
            <h2 className="font-serif text-[24px] font-semibold leading-tight text-forest-deep">
              {s.titulo}
            </h2>
            {s.cuerpo
              .split(/\n{2,}/)
              .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
              .filter(Boolean)
              .map((p, i) => (
                <p
                  key={i}
                  className="mt-3 text-[16px] leading-relaxed text-ink/80 text-pretty"
                >
                  {renderInline(p)}
                </p>
              ))}
          </div>
        ))}
      </div>
    </Section>
  );
}
