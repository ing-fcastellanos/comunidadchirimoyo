/* Footer.tsx — pie común de los sitios de la Comunidad. Server Component. */
export function Footer() {
  return (
    <footer className="mt-12 border-t border-forest/15 bg-paper-deep">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="font-serif text-[24px] font-semibold leading-tight text-forest-deep">
          Comunidad Chirimoyo
        </div>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink/75">
          En defensa del humedal de Chirimoyo · Orizaba, Veracruz, México.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-1 text-[14px] font-semibold text-forest">
          <a className="hover:text-forest-deep" href="/comunidad">Comunidad</a>
          <a className="hover:text-forest-deep" href="/voluntarios">Voluntarios</a>
          <a className="hover:text-forest-deep" href="https://aves.chirimoyo.org">Catálogo de aves</a>
          <a className="hover:text-forest-deep" href="/galeria">Galería</a>
          <a className="hover:text-forest-deep" href="/aliados">Proyectos aliados</a>
          <a className="hover:text-forest-deep" href="mailto:contacto@chirimoyo.org">Contacto</a>
        </div>
        <p className="mt-8 text-[13px] text-ink-soft/70">© Comunidad Chirimoyo</p>
      </div>
    </footer>
  );
}
