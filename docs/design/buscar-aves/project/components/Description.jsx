/* global React, window */
/* Description.jsx — descripción a dos columnas + pull quote lateral */
const { Section, SectionTitle } = window;

function Description() {
  return (
    <Section className="py-12 sm:py-16">
      <SectionTitle kicker="Identificación" icon="search">Descripción</SectionTitle>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
        <div className="columns-1 gap-10 text-[17px] leading-[1.75] text-ink/85 sm:columns-2 [&>p]:mb-4 [&>p]:break-inside-avoid">
          <p>
            Garza de mediano tamaño, robusta y de aspecto compacto. Su plumaje críptico es un mosaico de tonos
            marrones, amarillos y beige, con vientre claro estriado, que le permite mimetizarse con la
            vegetación palustre.
          </p>
          <p>
            Sus rasgos distintivos en campo son el <strong className="font-600 text-forest-deep">cuello marcadamente rayado</strong>,
            las <strong className="font-600 text-forest-deep">alas lisas y sin moteado</strong> —a diferencia de las garzas nocturnas
            juveniles con las que se confunde— y una <strong className="font-600 text-forest-deep">mancha negra lateral</strong> en el
            cuello, evidente en adultos y parda en juveniles.
          </p>
          <p>
            Cuando se siente amenazado adopta una postura inmóvil con el cuello y el pico apuntando hacia
            arriba, fundiéndose con las cañas.
          </p>
          <p>
            De hábitos solitarios y marcadamente crepusculares, es más activo al amanecer y al atardecer;
            el resto del día permanece oculto en la densa vegetación emergente.
          </p>
        </div>

        <aside className="self-start rounded-2xl border-l-4 border-mint-deep bg-paper-card p-7 shadow-soft">
          <p className="pull-quote font-serif text-[24px] leading-snug text-forest-deep">
            Se mimetiza con las cañas adoptando una postura inmóvil con el cuello extendido hacia arriba.
          </p>
        </aside>
      </div>
    </Section>
  );
}

window.Description = Description;
