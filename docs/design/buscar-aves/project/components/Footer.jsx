/* global React, window */
/* Footer.jsx — créditos y fuentes */
const { Icon, LOGO } = window;

const SOURCES = [
  "EncicloVida / CONABIO",
  "Wikipedia (es / en)",
  "eBird · Cornell Lab",
  "Aves Migratorias",
  "Animalia.bio",
  "Audubon Field Guide",
  "NOM-059-SEMARNAT-2010 · PROFEPA",
];

function Footer() {
  return (
    <footer className="mt-10 border-t border-forest/15 bg-paper-deep">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <img src={LOGO} alt="Logotipo de la Comunidad del Chirimoyo" className="h-14 w-14 rounded-full object-cover ring-1 ring-forest/15" />
              <div className="font-serif text-[24px] font-600 leading-tight text-forest-deep">
                Comunidad del Chirimoyo
                <span className="block font-sans text-[12px] font-700 uppercase tracking-[0.18em] text-forest/70">Guía de Aves</span>
              </div>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-ink/75">
              Laguna del Chirimoyo, Orizaba, Veracruz, México.
            </p>
            <p className="mt-1 text-[15px] text-ink/75">
              Dr. Eduardo Roldán Reyes · 2.ª Ed. Digital, 2025.
            </p>
          </div>
          <div>
            <div className="text-[12px] font-700 uppercase tracking-[0.2em] text-forest">Fuentes</div>
            <ul className="mt-3 space-y-1.5 text-[15px] text-ink/75">
              {SOURCES.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <Icon name="dot" className="h-4 w-4 text-mint-deep" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-forest/10 pt-6 text-[13px] text-ink-soft/70">
          Ficha elaborada con fines educativos y de divulgación · Botaurus lentiginosus
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;
