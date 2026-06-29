/* MisionVision.tsx — sección "Misión y visión" de /comunidad (#19b). Server
   Component: renderiza misión y visión (dos tarjetas) y, si los hay, una fila de
   valores. El contenido viene curado de content/landing/mision-vision.json
   (arranca como placeholder). Reusa los primitivos y tokens del sitio. */
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Icon } from "@/components/ui/Icon";
import type { MisionVision as MisionVisionData } from "@/lib/landing";

function Tarjeta({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="flex flex-col rounded-2xl bg-paper-card p-7 shadow-card ring-1 ring-forest/[0.07] sm:p-8">
      <h3 className="font-serif text-[26px] font-semibold leading-tight text-forest-deep">{titulo}</h3>
      <p className="mt-3 text-[17px] leading-relaxed text-ink/80 text-pretty">{texto}</p>
    </div>
  );
}

export function MisionVision({ data }: { data: MisionVisionData }) {
  const { mision, vision, valores } = data;
  return (
    <Section className="py-16 sm:py-20">
      <SectionTitle kicker="Comunidad" icon="Compass">
        Misión y visión
      </SectionTitle>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Tarjeta titulo={mision.titulo} texto={mision.texto} />
        <Tarjeta titulo={vision.titulo} texto={vision.texto} />
      </div>

      {valores && valores.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {valores.map((v) => (
            <div key={v.titulo} className="flex items-start gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
                <Icon name={v.icono ?? "Sprout"} className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-serif text-[18px] font-semibold leading-tight text-forest-deep">{v.titulo}</h4>
                <p className="mt-1 text-[15px] leading-relaxed text-ink/75 text-pretty">{v.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
