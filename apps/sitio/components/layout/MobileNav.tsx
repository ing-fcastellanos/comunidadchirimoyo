"use client";
/* MobileNav.tsx — botón hamburguesa + drawer del menú del ecosistema (lo único
   interactivo del Header). Portado del handoff v0.dev (HeaderEcosistema.jsx):
   aria-expanded/aria-controls · cierra con Escape / clic fuera / al elegir enlace ·
   focus trap · scroll lock. Sin librerías externas. */
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export interface NavLink {
  titulo: string;
  url: string;
}

export function MobileNav({ links }: { links: NavLink[] }) {
  const [abierto, setAbierto] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const cerrar = () => setAbierto(false);

  /* Escape + focus trap mientras el drawer está abierto */
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar();
        return;
      }
      if (e.key === "Tab") {
        const cont = panelRef.current;
        if (!cont) return;
        const foco = cont.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])',
        );
        if (foco.length === 0) return;
        const primero = foco[0];
        const ultimo = foco[foco.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [abierto]);

  /* scroll lock + foco: al primer enlace al abrir, al botón al cerrar */
  useEffect(() => {
    if (!abierto) return;
    const boton = botonRef.current;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    }, 0);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = overflowPrevio;
      boton?.focus();
    };
  }, [abierto]);

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls="menu-ecosistema"
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mint-wash text-forest-deep ring-1 ring-forest/15 transition-colors hover:bg-mint-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25 sm:hidden"
      >
        <Icon name={abierto ? "X" : "Menu"} className="h-[22px] w-[22px]" />
      </button>

      {abierto && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div
            onClick={cerrar}
            className="absolute inset-0 bg-pine-deep/50 backdrop-blur-sm"
          />
          <nav
            id="menu-ecosistema"
            ref={panelRef}
            aria-label="Sitios del ecosistema"
            className="absolute right-0 top-0 flex h-full w-[82%] max-w-xs flex-col gap-2 bg-paper-card p-5 shadow-[0_0_60px_-10px_rgba(5,46,27,.5)]"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-[0.22em] text-forest">
                Ecosistema
              </span>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar menú"
                className="grid h-10 w-10 place-items-center rounded-full bg-mint-wash text-forest-deep ring-1 ring-forest/15 transition-colors hover:bg-mint-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
              >
                <Icon name="X" className="h-5 w-5" />
              </button>
            </div>
            {links.map((n) => (
              <a
                key={n.url}
                href={n.url}
                onClick={cerrar}
                className="flex items-center justify-between rounded-2xl bg-paper-deep px-5 py-4 font-serif text-[22px] font-semibold text-forest-deep ring-1 ring-forest/10 transition-colors hover:bg-mint-wash focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
              >
                {n.titulo}
                <Icon name="ArrowUpRight" className="h-5 w-5 text-forest/40" />
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
