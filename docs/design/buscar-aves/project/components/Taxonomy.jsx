/* global React, window */
/* Taxonomy.jsx — tabla de clasificación taxonómica */
const { Section, SectionTitle } = window;

const TAXONOMY = [
  ["Reino", "Animalia"],
  ["Filo", "Chordata"],
  ["Clase", "Aves"],
  ["Orden", "Pelecaniformes"],
  ["Familia", "Ardeidae"],
  ["Género", "Botaurus"],
  ["Especie", "Botaurus lentiginosus"],
];

function Taxonomy() {
  return (
    <Section className="py-12 sm:py-16">
      <SectionTitle kicker="Clasificación" icon="git-fork">Taxonomía</SectionTitle>
      <div className="overflow-hidden rounded-2xl bg-paper-card shadow-card ring-1 ring-forest/[0.07]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-mint-wash text-[12px] font-700 uppercase tracking-[0.18em] text-forest">
              <th className="px-7 py-4 font-700">Nivel</th>
              <th className="px-7 py-4 font-700">Taxón</th>
            </tr>
          </thead>
          <tbody>
            {TAXONOMY.map(([level, taxon]) => (
              <tr key={level} className="bg-paper-card">
                <td className="border-t border-forest/[0.08] px-7 py-3.5 text-[16px] font-600 text-forest-soft">{level}</td>
                <td className={`border-t border-forest/[0.08] px-7 py-3.5 text-[17px] text-ink ${level === "Género" || level === "Especie" ? "italic font-serif text-[19px]" : ""}`}>
                  {taxon}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

window.Taxonomy = Taxonomy;
