/* global React, ReactDOM, window */
/* =====================================================================
   app.jsx — ensambla la ficha completa a partir de los componentes
   individuales definidos en /components (cargados antes que este script).
   ===================================================================== */
const {
  useLucide,
  Header, HeroFicha, QuickFacts, Description, DetailCards,
  Distribution, VocalizationSection, Observation, Conservation, Taxonomy, Footer,
} = window;

function FichaAvetoro() {
  useLucide();

  return (
    <main className="bg-paper text-ink antialiased">
      <Header />
      <HeroFicha />
      <QuickFacts />
      <Description />
      <DetailCards />
      <Distribution />

      {/* ancla para el enlace "Escuchar canto" del header */}
      <div id="vocalizacion"></div>
      <VocalizationSection />

      <Observation />
      <Conservation />
      <Taxonomy />
      <Footer />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<FichaAvetoro />);
