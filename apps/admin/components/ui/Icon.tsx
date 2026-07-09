/* Icon.tsx — wrapper tipado sobre lucide-react (iconos decorativos, trazo ~2px).
   Copiado de docs/design-system/primitives. */
import { icons, type LucideProps } from "lucide-react";

/** Nombres en PascalCase del set de lucide-react (p. ej. "Bird", "MapPin"). */
export type IconName = keyof typeof icons;

type Props = { name: IconName } & LucideProps;

export function Icon({ name, strokeWidth = 2, ...props }: Props) {
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon strokeWidth={strokeWidth} aria-hidden {...props} />;
}
