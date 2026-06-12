/* global React, window */
/* HeroCarousel.jsx — carrusel de fotos del hero + lightbox a pantalla completa */
const { useEffect, useState } = React;
const { PHOTO, ChevLeft, ChevRight, XGlyph, Expand, Camera, ImageGlyph } = window;

const HERO_SLIDES = [
  {
    src: PHOTO,
    alt: "Avetoro Norteño en postura erguida, mimetizado entre pastos y cañas secas de un humedal.",
    caption: "Avetoro Norteño · Laguna del Chirimoyo",
  },
  { placeholder: true, caption: "Espacio para otra fotografía del avetoro" },
  { placeholder: true, caption: "Espacio para una toma del hábitat" },
];

/* ---- Lightbox: imagen a tamaño ventana con botón de cierre ---- */
function Lightbox({ slides, index, onClose, onNav }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onNav(-1);
      else if (e.key === "ArrowRight") onNav(1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [onClose, onNav]);

  const slide = slides[index];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pine-deep/95 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Vista ampliada de la imagen">
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Cerrar vista ampliada"
        className="absolute right-5 top-5 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-paper ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40"
      >
        <XGlyph className="h-6 w-6" />
      </button>

      {slides.length > 1 && (
        <React.Fragment>
          <button onClick={(e) => { e.stopPropagation(); onNav(-1); }} aria-label="Imagen anterior" className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-paper ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20 sm:left-8">
            <ChevLeft className="h-6 w-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNav(1); }} aria-label="Imagen siguiente" className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-paper ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20 sm:right-8">
            <ChevRight className="h-6 w-6" />
          </button>
        </React.Fragment>
      )}

      <figure className="flex max-h-[92vh] max-w-[92vw] flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        {slide.placeholder ? (
          <div className="placeholder-stripes grid aspect-[4/3] w-[min(80vw,900px)] place-items-center rounded-xl ring-1 ring-white/15">
            <span className="flex flex-col items-center gap-2 text-forest-deep/70">
              <ImageGlyph className="h-10 w-10" />
              <span className="font-mono text-[13px]">{slide.caption}</span>
            </span>
          </div>
        ) : (
          <img src={slide.src} alt={slide.alt} className="max-h-[82vh] w-auto max-w-full rounded-lg object-contain shadow-2xl" />
        )}
        <figcaption className="flex items-center gap-2 font-mono text-[13px] tracking-wide text-paper/85">
          <Camera className="h-4 w-4" />
          {slide.caption}
          <span className="ml-2 text-paper/45">{index + 1} / {slides.length}</span>
        </figcaption>
      </figure>
    </div>
  );
}

/* ---- Carrusel del hero ---- */
function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const slides = HERO_SLIDES;
  const n = slides.length;

  const go = (dir) => setIndex((i) => (i + dir + n) % n);
  const slide = slides[index];

  return (
    <figure className="relative min-h-[340px] overflow-hidden bg-paper-deep lg:min-h-[600px]">
      {slides.map((s, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-500 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          {s.placeholder ? (
            <button
              onClick={() => setOpen(true)}
              className="placeholder-stripes group flex h-full w-full flex-col items-center justify-center gap-3 text-forest-deep/60"
              aria-label={"Ampliar: " + s.caption}
            >
              <ImageGlyph className="h-10 w-10" />
              <span className="font-mono text-[13px]">{s.caption}</span>
            </button>
          ) : (
            <button onClick={() => setOpen(true)} className="group block h-full w-full cursor-zoom-in" aria-label={"Ampliar fotografía: " + s.caption}>
              <img src={s.src} alt={s.alt} className="h-full w-full object-cover" />
            </button>
          )}
        </div>
      ))}

      {/* indicio de ampliar */}
      <span className="pointer-events-none absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-pine-deep/45 text-paper ring-1 ring-white/20 backdrop-blur">
        <Expand className="h-5 w-5" />
      </span>

      {/* flechas */}
      {n > 1 && (
        <React.Fragment>
          <button onClick={() => go(-1)} aria-label="Imagen anterior" className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper-card/85 text-forest-deep shadow-card ring-1 ring-forest/10 backdrop-blur transition-colors hover:bg-paper-card">
            <ChevLeft className="h-5 w-5" />
          </button>
          <button onClick={() => go(1)} aria-label="Imagen siguiente" className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper-card/85 text-forest-deep shadow-card ring-1 ring-forest/10 backdrop-blur transition-colors hover:bg-paper-card">
            <ChevRight className="h-5 w-5" />
          </button>
        </React.Fragment>
      )}

      {/* pie de foto */}
      <figcaption className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pine-deep/75 to-transparent px-6 pb-14 pt-16">
        <span className="flex items-center gap-2 font-mono text-[12px] tracking-wide text-paper/90">
          <Camera className="h-4 w-4" />
          {slide.caption}
        </span>
      </figcaption>

      {/* puntos */}
      {n > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={"Ir a la imagen " + (i + 1)}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-paper" : "w-2 bg-paper/50 hover:bg-paper/80"}`}
            ></button>
          ))}
        </div>
      )}

      {open && <Lightbox slides={slides} index={index} onClose={() => setOpen(false)} onNav={go} />}
    </figure>
  );
}

window.HeroCarousel = HeroCarousel;
