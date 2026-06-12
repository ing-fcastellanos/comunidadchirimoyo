/* global React, window */
/* Vocalization.jsx — sección de vocalización con reproductor sintetizado (Web Audio) */
const { useEffect, useRef, useState } = React;
const { AudioLines, InfoGlyph, PlayGlyph, Spinner } = window;

/* impulso de reverberación (eco de pantano) */
function makeImpulse(ctx, seconds, decay) {
  const rate = ctx.sampleRate;
  const len = rate * seconds;
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

/* programa una sílaba "bombeada" resonante */
function pump(ctx, dest, t, { freq, dur, gain, filt, glide = 0 }) {
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.linearRampToValueAtTime(freq + glide, t + dur);

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(filt, t);
  bp.Q.value = 7;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.05);
  g.gain.linearRampToValueAtTime(gain * 0.55, t + dur * 0.45);
  g.gain.linearRampToValueAtTime(gain * 0.95, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc.connect(bp).connect(g).connect(dest);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function VocalizationSection() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const stopAtRef = useRef(0);
  const barsRef = useRef([]);

  const NBARS = 40;
  const idleHeights = Array.from({ length: NBARS }, (_, i) =>
    18 + Math.round(Math.abs(Math.sin(i * 0.7)) * 22 + (i % 3) * 4)
  );

  function animate() {
    const an = analyserRef.current;
    if (!an) return;
    const data = new Uint8Array(an.frequencyBinCount);
    an.getByteFrequencyData(data);
    barsRef.current.forEach((bar, i) => {
      if (!bar) return;
      const v = data[Math.floor((i / NBARS) * (an.frequencyBinCount * 0.55))] || 0;
      bar.style.height = Math.max(8, (v / 255) * 80) + "%";
      bar.style.opacity = 0.45 + (v / 255) * 0.55;
    });
    if (ctxRef.current.currentTime < stopAtRef.current) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      stopVisual();
      setPlaying(false);
    }
  }

  function stopVisual() {
    cancelAnimationFrame(rafRef.current);
    barsRef.current.forEach((bar, i) => {
      if (bar) { bar.style.height = idleHeights[i] + "%"; bar.style.opacity = 0.5; }
    });
  }

  function play() {
    if (playing) return;
    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const an = ctx.createAnalyser();
      an.fftSize = 128;
      analyserRef.current = an;
    }
    ctx.resume();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    const conv = ctx.createConvolver();
    conv.buffer = makeImpulse(ctx, 1.4, 3.2);
    const wet = ctx.createGain(); wet.gain.value = 0.3;
    const dry = ctx.createGain(); dry.gain.value = 0.85;
    master.connect(dry).connect(analyserRef.current);
    master.connect(conv).connect(wet).connect(analyserRef.current);
    analyserRef.current.connect(ctx.destination);

    const t0 = ctx.currentTime + 0.08;
    // secuencia de bombeo "oonk-GA-loonk", repetida dos veces
    const seq = [
      { off: 0.00, freq: 92,  dur: 0.34, gain: 0.5,  filt: 300, glide: 18 },  // oonk
      { off: 0.46, freq: 120, dur: 0.30, gain: 0.95, filt: 520, glide: -8 },  // GA (acento)
      { off: 0.88, freq: 80,  dur: 0.46, gain: 0.6,  filt: 240, glide: -22 }, // loonk (cae)
    ];
    const reps = 2;
    let last = t0;
    for (let r = 0; r < reps; r++) {
      const base = t0 + r * 1.7;
      seq.forEach((s) => {
        pump(ctx, master, base + s.off, s);
        last = base + s.off + s.dur;
      });
    }
    stopAtRef.current = last + 0.3;
    setPlaying(true);
    rafRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <section className="my-6 bg-pine-deep">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[12px] font-700 uppercase tracking-[0.26em] text-mint">
            <AudioLines className="h-4 w-4" />
            Vocalización
          </div>
          <h2 className="font-serif text-[clamp(34px,5vw,52px)] font-600 leading-[0.98] text-paper">
            El tambor del pantano
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-mint-soft/85">
            Produce un sonido resonante y grave mediante sacos de aire en el cuello,
            descrito como <span className="font-serif text-[20px] italic text-mint">«oonk-GA-loonk»</span>.
            Ese eco de bombeo le ha valido los nombres en inglés de
            <em className="not-italic font-600 text-paper"> Thunder Pumper</em>,
            <em className="not-italic font-600 text-paper"> Stake Driver</em> y
            <em className="not-italic font-600 text-paper"> Bog Bumper</em>.
            Se emite sobre todo en primavera y verano, en sus zonas de cría.
          </p>
        </div>

        <div className="rounded-3xl bg-white/[0.04] p-7 ring-1 ring-white/10 sm:p-9">
          <div className="flex items-center gap-5">
            <button
              onClick={play}
              aria-label={playing ? "Reproduciendo el canto" : "Reproducir el canto del avetoro"}
              className={`grid h-16 w-16 shrink-0 place-items-center rounded-full bg-mint text-pine-deep transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40 ${playing ? "scale-105" : ""}`}
            >
              {playing
                ? <Spinner className="h-7 w-7 animate-spin" />
                : <PlayGlyph className="h-7 w-7 translate-x-0.5" />}
            </button>
            <div className="min-w-0">
              <div className="font-serif text-[22px] font-600 leading-tight text-paper">Canto de cortejo</div>
              <div className="text-[14px] text-mint-soft/70">Toca para escuchar la secuencia «oonk-GA-loonk»</div>
            </div>
          </div>

          {/* visualizador de onda */}
          <div className="mt-7 flex h-24 items-center gap-[3px] rounded-xl bg-black/20 px-4 py-3">
            {Array.from({ length: NBARS }).map((_, i) => (
              <span
                key={i}
                ref={(el) => (barsRef.current[i] = el)}
                className="flex-1 rounded-full bg-mint transition-[height,opacity] duration-100"
                style={{ height: idleHeights[i] + "%", opacity: 0.5 }}
              ></span>
            ))}
          </div>

          <p className="mt-5 flex items-start gap-2 text-[13px] leading-relaxed text-mint-soft/60">
            <InfoGlyph className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Interpretación sonora sintetizada con fines ilustrativos. Para grabaciones de campo
              auténticas, consulta la Macaulay Library / eBird del sitio.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

window.VocalizationSection = VocalizationSection;
