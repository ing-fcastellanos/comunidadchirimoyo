/* global React, window */
/* Header.jsx — barra superior fija con logo y enlace al canto */
const { Icon, LOGO } = window;

function Header() {
  return (
    <div className="sticky top-0 z-20 border-b border-forest/10 bg-paper-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <a href="#" className="flex items-center gap-3">
          <img src={LOGO} alt="Logotipo de la Comunidad del Chirimoyo" className="h-12 w-12 rounded-full object-cover ring-1 ring-forest/15" />
          <span className="leading-tight">
            <span className="block font-serif text-[20px] font-600 text-forest-deep">Comunidad del Chirimoyo</span>
            <span className="block text-[11px] font-700 uppercase tracking-[0.2em] text-forest/70">Guía de Aves · Orizaba, Veracruz</span>
          </span>
        </a>
        <a href="#vocalizacion" className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-mint-wash px-4 py-2 text-[13px] font-600 text-forest-deep ring-1 ring-forest/15 transition-colors hover:bg-mint-soft sm:inline-flex">
          <Icon name="audio-lines" className="h-4 w-4" />
          Escuchar canto
        </a>
      </div>
    </div>
  );
}

window.Header = Header;
