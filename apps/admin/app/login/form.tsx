"use client";
/* form.tsx — formulario de login (#139), traducido del mockup de Claude
   Design (proyecto "Guia aves chirimoyo", Login.jsx/Login.html). Mismo
   lenguaje visual que Contacto.jsx (componente Campo, alerta de error,
   Spinner); íconos de lucide en PascalCase (Icon real, no el kebab-case del
   mockup).

   Flujo (ver design.md D6): signInWithEmailAndPassword (Web SDK, en el
   navegador — el password NUNCA toca nuestro backend) → idToken → fetch POST
   a /api/auth/session (Route Handler, NUNCA una Server Action) → en éxito,
   window.location.href (reload completo, NUNCA router.push): el bug de
   "Server Action + redirect() → loop a /login" en esta topología (Next 15 +
   Firebase Hosting rewrite a Cloud Run) ya lo vivió sociedadsalvaje/apps/admin. */
import { useRef, useState } from "react";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { Icon } from "@/components/ui/Icon";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

/* ---------- íconos SVG propios (no lucide, espejo de Contacto.jsx) ---------- */
function Flecha({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
    </svg>
  );
}
function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={3} strokeOpacity={0.3} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
function Alerta({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 9v4" /><path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  );
}

/* ---------- campo de texto (espejo de Contacto.jsx, sin error por-campo:
   Firebase Auth ya unifica el error a nivel de formulario, ver mapAuthError) ---------- */
function Campo({
  id,
  etiqueta,
  tipo = "text",
  valor,
  onChange,
  disabled,
  ...props
}: {
  id: string;
  etiqueta: string;
  tipo?: string;
  valor: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const base =
    "w-full rounded-xl border bg-white px-4 text-[16px] text-ink placeholder:text-ink-soft/45 transition-colors h-[52px] " +
    `border-forest/15 hover:border-forest/30 ${FOCO}` +
    (disabled ? " cursor-not-allowed opacity-60" : "");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-semibold text-ink">
        {etiqueta}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        onChange={onChange}
        disabled={disabled}
        aria-required="true"
        className={base}
        {...props}
      />
    </div>
  );
}

/** Firebase Auth moderno ya unifica email/password incorrectos bajo
    `auth/invalid-credential` (anti-enumeración nativo) — solo traducimos el
    código a español, sin lógica de seguridad propia que inventar. */
function mapAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/invalid-email":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Correo o contraseña incorrectos.";
      case "auth/too-many-requests":
        return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
      case "auth/user-disabled":
        return "Esta cuenta está deshabilitada. Contacta a quien administra el panel.";
      case "auth/network-request-failed":
        return "Error de red. Revisa tu conexión e inténtalo de nuevo.";
      default:
        return "No se pudo iniciar sesión. Inténtalo de nuevo.";
    }
  }
  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const alertaRef = useRef<HTMLDivElement>(null);

  function fallar(mensaje: string) {
    setError(mensaje);
    setEnviando(false);
    setTimeout(() => alertaRef.current?.focus(), 0);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !password) {
      fallar("Escribe tu correo y tu contraseña.");
      return;
    }

    setError(undefined);
    setEnviando(true);

    try {
      const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
      const idToken = await cred.user.getIdToken();

      const resp = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = (await resp.json().catch(() => ({}))) as {
        ok?: boolean;
        redirectTo?: string;
        error?: string;
      };

      if (!resp.ok || !data.ok) {
        fallar(data.error ?? "No se pudo iniciar sesión.");
        return;
      }

      // Reload completo — NUNCA router.push. Ver la nota en el header del
      // archivo: garantiza que el navegador envíe la cookie httpOnly en el
      // siguiente request como navegación normal, no como RSC fetch.
      window.location.href = data.redirectTo ?? "/dashboard";
    } catch (err) {
      fallar(mapAuthError(err));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="flex w-full max-w-[400px] flex-col items-center gap-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
            <Icon name="ShieldCheck" className="h-5 w-5" />
          </span>
          <span className="font-serif text-[22px] font-semibold leading-tight text-forest-deep">
            Comunidad Chirimoyo <span className="text-ink/50">· Admin</span>
          </span>
        </div>

        <div className="w-full rounded-2xl bg-paper-card p-7 shadow-card ring-1 ring-forest/10 sm:p-8">
          <h1 className="font-serif text-[26px] font-semibold leading-tight text-forest-deep">
            Iniciar sesión
          </h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
            Acceso solo para el equipo de administración.
          </p>

          {error && (
            <div
              ref={alertaRef}
              role="alert"
              tabIndex={-1}
              className={`mt-5 flex items-start gap-3 rounded-xl bg-[#f6e1da] px-4 py-3.5 text-[14px] font-semibold text-[#8f3c25] ring-1 ring-[#b5543a]/20 ${FOCO}`}
            >
              <Alerta className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <Campo
              id="email"
              etiqueta="Correo"
              tipo="email"
              valor={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={enviando}
              autoComplete="email"
              placeholder="tucorreo@chirimoyo.org"
            />
            <Campo
              id="password"
              etiqueta="Contraseña"
              tipo="password"
              valor={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={enviando}
              autoComplete="current-password"
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={enviando}
              className={`mt-2 inline-flex h-[52px] items-center justify-center gap-2.5 rounded-xl bg-forest px-7 text-[16px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(12,90,54,.7)] transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-80 ${FOCO}`}
            >
              {enviando ? (
                <>
                  <Spinner className="h-5 w-5" />
                  Ingresando…
                </>
              ) : (
                <>
                  Iniciar sesión
                  <Flecha className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="max-w-[320px] text-center text-[13px] leading-relaxed text-ink-soft/80">
          ¿No tienes cuenta? Las altas son manuales — pide acceso a quien administra el panel.
        </p>
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {enviando ? "Iniciando sesión…" : ""}
      </div>
    </main>
  );
}
