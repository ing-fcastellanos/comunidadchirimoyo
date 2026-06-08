/* Section.tsx — contenedor de sección (max-w-6xl, px-6). Server Component.
   Copiado de docs/design-system/primitives. */
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function Section({ children, className = "", id }: Props) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-6 ${className}`}>
      {children}
    </section>
  );
}
