"use client";
/* logout-button.tsx — botón de cerrar sesión (#139). Llama al DELETE del
   route handler de sesión y hace un reload completo (window.location.href),
   NUNCA router.push: mismo motivo que el login — la navegación normal es la
   que garantiza que el siguiente request ya no lleve la cookie limpiada. */
import { useState } from "react";

export function LogoutButton() {
  const [saliendo, setSaliendo] = useState(false);

  async function onClick() {
    setSaliendo(true);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saliendo}
      className="inline-flex h-10 items-center justify-center rounded-xl bg-mint-wash px-4 text-[14px] font-semibold text-forest-deep transition-colors hover:bg-mint-soft disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40"
    >
      {saliendo ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
