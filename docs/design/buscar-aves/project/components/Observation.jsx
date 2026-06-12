/* global React, window */
/* Observation.jsx — claves para observación (tres tarjetas) */
const { Icon, Section, SectionTitle } = window;

const OBSERVATION = [
  {
    icon: "eye",
    title: "Apariencia",
    body: "Silueta de garza pequeña-mediana; cuello grueso con rayas verticales pardas y blanco-amarillentas, mancha negra lateral en el cuello (adultos), pico y patas amarillo-verdosos. Vuelo bajo y pesado con el cuello recogido en \u201CS\u201D.",
  },
  {
    icon: "map-pin",
    title: "Zona en la laguna",
    body: "Pastizales y bordes con vegetación densa, especialmente zonas con tulares o carrizos. Camina despacio por las orillas y busca siluetas inmóviles entre las cañas.",
  },
  {
    icon: "calendar-range",
    title: "Fechas",
    body: "Ventana invernal probable de finales de octubre a marzo (migración hacia el sur de agosto a noviembre). Sin calendario local publicado: consulta los registros de eBird del sitio.",
  },
];

function Observation() {
  return (
    <Section className="py-12 sm:py-16">
      <SectionTitle kicker="En el campo" icon="binoculars">Claves para observación</SectionTitle>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {OBSERVATION.map((o) => (
          <article key={o.title} className="flex flex-col rounded-2xl bg-paper-card p-7 shadow-card ring-1 ring-forest/[0.07]">
            <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-mint-wash text-forest-deep">
              <Icon name={o.icon} className="h-6 w-6" />
            </span>
            <h3 className="font-serif text-[24px] font-600 text-forest-deep">{o.title}</h3>
            <p className="mt-2 text-[16px] leading-relaxed text-ink/80">{o.body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

window.Observation = Observation;
