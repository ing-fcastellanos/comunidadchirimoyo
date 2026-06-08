/* =====================================================================
   Icon.tsx — wrapper tipado sobre lucide-react.
   Iconos decorativos con trazo ~2px. Para controles interactivos que se
   re-renderizan, usar glifos SVG propios (ver guía), no este wrapper.
   Copiar a components/ui/ durante el scaffold. Requiere `lucide-react`.
   ===================================================================== */
import { icons, type LucideProps } from "lucide-react";

/* Nombres en PascalCase del set de lucide-react (p. ej. "Bird", "MapPin").
   En el prototipo del handoff los nombres venían en kebab-case
   (data-lucide="map-pin"); al portar, convertir a PascalCase. */
export type IconName = keyof typeof icons;

type Props = { name: IconName } & LucideProps;

export function Icon({ name, strokeWidth = 2, ...props }: Props) {
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon strokeWidth={strokeWidth} aria-hidden {...props} />;
}
