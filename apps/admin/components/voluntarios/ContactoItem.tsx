import type { Contacto } from "@/lib/voluntarios/types";

function fechaLarga(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ContactoItem({ contacto }: { contacto: Contacto }) {
  return (
    <li className="rounded-xl bg-mint-wash/40 p-4 ring-1 ring-forest/10">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-ink-soft">
        <span className="font-semibold text-forest-deep">{contacto.quien}</span>
        <span>{fechaLarga(contacto.fecha)}</span>
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{contacto.nota}</p>
    </li>
  );
}
