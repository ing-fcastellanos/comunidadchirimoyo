/* global React, window */
/* DetailCards.jsx — tarjetas de detalle: Dieta y ecología + Reproducción */
const { Section, SectionTitle } = window;

function DetailCards() {
  return (
    <Section className="py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <article className="rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07]">
          <SectionTitle kicker="Alimentación" icon="fish">Dieta y ecología</SectionTitle>
          <p className="text-[17px] leading-[1.75] text-ink/85">
            Carnívora oportunista. Se alimenta de <strong className="font-600 text-forest-deep">peces pequeños</strong>,
            anfibios (ranas, salamandras), insectos acuáticos y crustáceos y, ocasionalmente, pequeños mamíferos,
            reptiles y otros invertebrados. Caza al acecho desde la vegetación, lanzando su pico con rapidez.
            Habita tulares, carrizales y pastizales inundables, donde permanece oculta gran parte del día.
          </p>
        </article>

        <article className="rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07]">
          <SectionTitle kicker="Ciclo de vida" icon="egg">Reproducción</SectionTitle>
          <p className="text-[17px] leading-[1.75] text-ink/85">
            Anida solitariamente sobre <strong className="font-600 text-forest-deep">plataformas de plantas acuáticas</strong>, a baja
            altura sobre el agua. La hembra construye el nido y pone de 2 a 6 huevos (las fuentes varían), con una
            incubación cercana a los <strong className="font-600 text-forest-deep">29 días</strong>. Los polluelos son altriciales y
            permanecen varias semanas en el nido. Cría en el norte de EUA y Canadá; <strong className="font-600 text-forest-deep">no se reproduce</strong> en
            la Laguna del Chirimoyo.
          </p>
        </article>
      </div>
    </Section>
  );
}

window.DetailCards = DetailCards;
