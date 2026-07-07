/* ElCaso.tsx — el caso del humedal a partir del cuerpo de lucha.md (qué es / la
   amenaza / qué pedimos / cómo lo demostramos). Server Component. El texto NO se
   duplica: llega como secciones desde el data-layer. Renderiza **negritas** de
   markdown de forma segura (contenido propio del repo). */
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Icon } from "@/components/ui/Icon";
import type { ReactNode } from "react";

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

export interface ElCasoProps {
  secciones: { titulo: string; cuerpo: string }[];
  fotoUrl: string | null;
  fotoAlt: string | null;
}

export function ElCaso({ secciones, fotoUrl, fotoAlt }: ElCasoProps) {
  return (
    <Section id="el-caso" className="py-14 sm:py-20">
      <SectionTitle kicker="El caso" icon="Sprout">
        Por qué defendemos el Chirimoyo
      </SectionTitle>

      <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
        <div className="space-y-7">
          {secciones.map((s) => (
            <div key={s.titulo}>
              <h3 className="font-serif text-[22px] font-semibold leading-tight text-forest-deep">
                {s.titulo}
              </h3>
              {s.cuerpo
                .split(/\n{2,}/)
                .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
                .filter(Boolean)
                .map((p, i) => (
                  <p
                    key={i}
                    className="mt-2 text-[16px] leading-relaxed text-ink/80 text-pretty"
                  >
                    {renderInline(p)}
                  </p>
                ))}
            </div>
          ))}
        </div>

        {fotoUrl && (
          <figure className="relative self-start">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper-deep shadow-card ring-1 ring-forest/10">
              <Image
                src={fotoUrl}
                alt={fotoAlt ?? "El humedal del Chirimoyo"}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 flex items-center gap-2 text-[13px] text-ink-soft/80">
              <Icon name="Camera" className="h-4 w-4 shrink-0" />
              El humedal cubierto de lirio acuático, la planta que las jornadas
              retiran.
            </figcaption>
          </figure>
        )}
      </div>
    </Section>
  );
}
