/* global React, window */
/* QuickFacts.jsx — panel de datos rápidos (grid de 6 tarjetas) */
const { Icon, Section } = window;

const QUICK = [
  { icon: "ruler",           label: "Tamaño",      value: "59–70 cm" },
  { icon: "move-horizontal", label: "Envergadura", value: "95–115 cm" },
  { icon: "list-tree",       label: "Orden",       value: "Pelecaniformes" },
  { icon: "feather",         label: "Familia",     value: "Ardeidae" },
  { icon: "trees",           label: "Hábitat",     value: "Humedales con vegetación densa" },
  { icon: "sunrise",         label: "Mejor hora",  value: "Amanecer y atardecer" },
];

function QuickFacts() {
  return (
    <Section className="py-12 sm:py-16">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {QUICK.map((q) => (
          <div key={q.label} className="flex items-start gap-3.5 rounded-2xl bg-paper-card p-5 shadow-card ring-1 ring-forest/[0.07]">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep">
              <Icon name={q.icon} className="h-[22px] w-[22px]" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-700 uppercase tracking-[0.16em] text-forest/70">{q.label}</div>
              <div className="mt-0.5 font-serif text-[20px] font-600 leading-tight text-forest-deep">{q.value}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

window.QuickFacts = QuickFacts;
