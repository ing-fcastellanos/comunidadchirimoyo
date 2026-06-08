/* Badge.tsx — insignia de estatus. Un tono por eje de simbología de la ficha.
   Copiado de docs/design-system/primitives. Server Component. */
import type { ReactNode } from "react";

export type BadgeTone = "forest" | "ochre" | "terra" | "teal";

const tones: Record<BadgeTone, string> = {
  forest: "bg-mint-soft text-forest-deep ring-forest/20",
  ochre: "bg-[#f3ead2] text-[#7a5e16] ring-[#e2d3a3]",
  terra: "bg-[#f6e1da] text-[#8f3c25] ring-[#e8c3b6]",
  teal: "bg-[#d6ece6] text-[#236b59] ring-[#aad3c8]",
};

type Props = {
  tone?: BadgeTone;
  children: ReactNode;
};

export function Badge({ tone = "forest", children }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ring-1 ring-inset ${tones[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {children}
    </span>
  );
}
