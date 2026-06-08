/* =====================================================================
   Section.tsx — contenedor de sección con el ancho y padding del ritmo
   del sistema (max-w-6xl, px-6). Server Component.
   Copiar a components/ui/ durante el scaffold.
   ===================================================================== */
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
