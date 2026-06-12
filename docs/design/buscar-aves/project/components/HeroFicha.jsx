/* global React, window */
/* HeroFicha.jsx — primera sección de la ficha: carrusel + nombre + badges */
const { Icon, Badge, HeroCarousel } = window;

function HeroFicha() {
  return (
    <header className="border-b border-forest/10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch lg:grid-cols-[1.05fr_1fr]">
        <HeroCarousel />

        <div className="flex flex-col justify-center gap-6 bg-paper px-6 py-12 sm:px-12 lg:py-16">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[12px] font-700 uppercase tracking-[0.24em] text-forest">
              <Icon name="bird" className="h-4 w-4" />
              Ficha de especie · Vadeadora
            </div>
            <h1 className="font-serif text-[clamp(46px,7vw,82px)] font-600 leading-[0.95] text-forest-deep">
              Avetoro Norteño
            </h1>
            <p className="mt-2 font-serif text-[clamp(22px,3.2vw,30px)] italic text-forest-soft">
              Botaurus lentiginosus <span className="text-[0.62em] not-italic text-ink-soft/70">(Rackett, 1813)</span>
            </p>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/80">
              Garza críptica y solitaria de los humedales de Norteamérica.
            </p>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft/80">
              <span className="font-600 text-ink">También:</span> Avetoro Lentiginoso · Avetoro Americano · Yaboa Americana · Martinete
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Badge tone="forest">Migratoria de invierno</Badge>
            <Badge tone="ochre">Rara</Badge>
            <Badge tone="terra">Protección Especial · NOM-059</Badge>
            <Badge tone="teal">Nativa</Badge>
          </div>
        </div>
      </div>
    </header>
  );
}

window.HeroFicha = HeroFicha;
