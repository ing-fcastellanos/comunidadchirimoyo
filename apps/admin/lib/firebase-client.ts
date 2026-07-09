/* firebase-client.ts — init del Web SDK de Firebase para el login (#139).
   SOLO para uso client-side (Client Components): `signInWithEmailAndPassword`
   corre en el navegador contra los servidores de Firebase directo — el
   password NUNCA pasa por nuestro backend. Config con NEXT_PUBLIC_FIREBASE_*
   (pública por diseño, ver .env.example). Init idempotente (getApps().length)
   para sobrevivir al hot-reload de Next.

   Dev con el Auth Emulator: a diferencia del Admin SDK (que detecta
   FIREBASE_AUTH_EMULATOR_HOST automáticamente), el Web SDK requiere
   connectAuthEmulator() explícito — se activa aquí con
   NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST (var de cliente, ver .env.local). */
import { getApps, initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let emulatorConectado = false;

/** Cliente de Firebase Auth (Web SDK), singleton contra el hot-reload. */
export function getFirebaseAuth() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
  if (emulatorHost && !emulatorConectado) {
    connectAuthEmulator(auth, `http://${emulatorHost}`, { disableWarnings: true });
    emulatorConectado = true;
  }

  return auth;
}
