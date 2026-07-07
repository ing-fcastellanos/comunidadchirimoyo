/* SectionTitle.tsx — encabezado de sección con kicker e icono opcional.
   Copiado de docs/design-system/primitives. Server Component. */
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Props = {
  children: ReactNode;
  kicker?: string;
  icon?: IconName;
  /** Nivel del encabezado. Default `h2` (sección). Usar `h1` cuando el título
      de la sección ES el título principal de la página (p. ej. un listado). */
  as?: "h1" | "h2";
};

export function SectionTitle({ children, kicker, icon, as: Heading = "h2" }: Props) {
  return (
    <header className="mb-7 flex items-end gap-4">
      {icon && (
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
          <Icon name={icon} className="h-6 w-6" />
        </span>
      )}
      <div>
        {kicker && (
          <div className="mb-0.5 text-[12px] font-bold uppercase tracking-[0.22em] text-forest-deep">
            {kicker}
          </div>
        )}
        <Heading className="font-serif text-[34px] font-semibold leading-none text-forest-deep">
          {children}
        </Heading>
      </div>
    </header>
  );
}
