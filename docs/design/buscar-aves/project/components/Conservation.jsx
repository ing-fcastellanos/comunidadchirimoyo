/* global React, window */
/* Conservation.jsx — estatus de conservación + datos curiosos */
const { Icon, Section, SectionTitle } = window;

const FACTS = [
  "En México alcanza hasta el centro del país durante la invernada; rara vez se le reporta más al sur.",
  "Su comportamiento críptico hace que esté seguramente subreportada en muchos humedales.",
  "En la Laguna del Chirimoyo fue documentada por el Dr. Eduardo Roldán Reyes en los pastizales del humedal \u2014 uno de los hitos del catálogo.",
];

function Conservation() {
  return (
    <Section className="py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <article className="rounded-2xl bg-mint-wash p-8 ring-1 ring-forest/10">
          <SectionTitle kicker="Estatus" icon="shield-check">Conservación</SectionTitle>
          <ul className="space-y-3 text-[16px] leading-relaxed text-ink/85">
            <li className="flex gap-3"><Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-forest" /><span><strong className="font-600 text-forest-deep">Protección Especial (Pr)</strong> según la NOM-059-SEMARNAT-2010, citada en el prólogo de la guía.</span></li>
            <li className="flex gap-3"><Icon name="globe" className="mt-1 h-4 w-4 shrink-0 text-forest" /><span><strong className="font-600 text-forest-deep">Preocupación Menor (LC)</strong> a nivel global según la UICN.</span></li>
            <li className="flex gap-3"><Icon name="triangle-alert" className="mt-1 h-4 w-4 shrink-0 text-ochre" /><span>La ficha original de la guía la clasifica como <em className="not-italic font-600">«Amenazada»</em>: existe esta discrepancia en la fuente.</span></li>
          </ul>
        </article>

        <article className="rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07]">
          <SectionTitle kicker="Aspectos adicionales" icon="sparkles">¿Sabías que…?</SectionTitle>
          <ul className="space-y-4">
            {FACTS.map((f, i) => (
              <li key={i} className="flex gap-4 text-[16px] leading-relaxed text-ink/85">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mint-soft font-serif text-[16px] font-600 text-forest-deep">{i + 1}</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </Section>
  );
}

window.Conservation = Conservation;
