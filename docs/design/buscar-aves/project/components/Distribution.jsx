/* global React, window */
/* Distribution.jsx — tarjeta de distribución con mapa estilizado de Norteamérica */
const { Section, SectionTitle } = window;

const LAND =
  "M40 120 C30 90 70 78 95 92 L120 86 C150 60 210 58 250 70 C300 80 360 75 372 110 " +
  "C384 140 360 160 348 175 L352 200 C356 225 330 235 312 244 C300 252 296 262 300 275 " +
  "C304 288 292 296 280 290 C270 285 268 272 262 268 L250 270 C240 285 245 305 238 322 " +
  "C232 340 226 352 230 366 C236 384 248 392 256 402 C268 414 262 430 250 432 C240 434 236 424 234 416 " +
  "C230 405 222 400 214 404 C206 408 204 420 196 422 C186 424 184 412 188 402 C192 392 186 384 178 380 " +
  "C168 375 162 360 158 345 C152 322 160 300 150 282 C140 264 120 258 108 248 C92 236 78 226 72 210 " +
  "C64 188 60 168 52 152 C46 140 36 134 40 120 Z";

const DistributionMap = () => (
  <svg viewBox="0 0 420 470" className="h-auto w-full max-w-[440px]" role="img" aria-label="Mapa estilizado de Norteamérica: en verde la zona de cría en el sur de Canadá y Estados Unidos, en menta la zona de invernada desde el sur de Estados Unidos hasta Panamá, con un punto que marca la Laguna del Chirimoyo en México.">
    <defs>
      <clipPath id="land-clip"><path d={LAND} /></clipPath>
    </defs>
    <rect x="0" y="0" width="420" height="470" fill="#dcebe4" rx="14" />
    <g stroke="#c4ddd1" strokeWidth="1" opacity="0.8">
      {[80, 160, 240, 320].map((y) => <line key={y} x1="0" x2="420" y1={y} y2={y} />)}
      {[105, 210, 315].map((x) => <line key={x} y1="0" y2="470" x1={x} x2={x} />)}
    </g>
    <g clipPath="url(#land-clip)">
      <rect x="0" y="0" width="420" height="470" fill="#eef5ef" />
      <rect x="0" y="0" width="420" height="216" fill="#15824c" opacity="0.88" />
      <rect x="0" y="216" width="420" height="470" fill="#8ed8c0" />
      <line x1="0" x2="420" y1="216" y2="216" stroke="#ffffff" strokeWidth="2" strokeDasharray="5 5" opacity="0.85" />
    </g>
    <g fill="#8ed8c0">
      <ellipse cx="330" cy="258" rx="13" ry="6" />
      <ellipse cx="352" cy="272" rx="8" ry="4.5" />
      <ellipse cx="312" cy="270" rx="6" ry="4" />
    </g>
    <path d={LAND} fill="none" stroke="#0c5a36" strokeWidth="2" strokeOpacity="0.5" strokeLinejoin="round" />
    <g>
      <circle cx="222" cy="300" r="11" fill="none" stroke="#0c5a36" strokeWidth="1.5" opacity="0.5" />
      <circle cx="222" cy="300" r="4.5" fill="#0c5a36" />
    </g>
  </svg>
);

function Distribution() {
  return (
    <Section className="py-12 sm:py-16">
      <SectionTitle kicker="Rango neártico" icon="map">Distribución</SectionTitle>
      <div className="grid grid-cols-1 items-center gap-10 rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07] lg:grid-cols-[440px_1fr] sm:p-10">
        <div className="grid place-items-center">
          <DistributionMap />
        </div>
        <div className="space-y-6">
          <p className="text-[16px] leading-relaxed text-ink/80">
            Especie de distribución neártica. En México se le observa principalmente durante el invierno, en
            humedales del centro y sur del país.
          </p>
          <div className="flex items-start gap-4">
            <span className="mt-1 h-4 w-7 shrink-0 rounded-full bg-forest"></span>
            <div>
              <h3 className="font-serif text-[22px] font-600 text-forest-deep">Zona de cría</h3>
              <p className="mt-1 text-[16px] leading-relaxed text-ink/80">
                Sur de Canadá (Columbia Británica, Gran Lago del Esclavo, Bahía de Hudson) y gran parte de Estados Unidos.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="mt-1 h-4 w-7 shrink-0 rounded-full bg-mint"></span>
            <div>
              <h3 className="font-serif text-[22px] font-600 text-forest-deep">Zona de invernada</h3>
              <p className="mt-1 text-[16px] leading-relaxed text-ink/80">
                Sur de EUA, costas del Golfo y del Pacífico, todo México, el Caribe y Centroamérica hasta Panamá.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="mt-1 grid h-4 w-7 shrink-0 place-items-center">
              <span className="h-2.5 w-2.5 rounded-full bg-forest-deep ring-2 ring-forest/30"></span>
            </span>
            <div>
              <h3 className="font-serif text-[22px] font-600 text-forest-deep">Laguna del Chirimoyo</h3>
              <p className="mt-1 text-[16px] leading-relaxed text-ink/80">
                Orizaba, Veracruz — sitio de invernada documentado dentro de su rango.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

window.Distribution = Distribution;
