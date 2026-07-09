/* firebase-admin.ts — cliente Admin SDK SOLO server-side para el login (#139).
   Init por ADC (Application Default Credentials): SIN llave JSON en el repo.
   En Cloud Run, ADC viene del service account runtime (requiere
   roles/iam.serviceAccountTokenCreator sobre sí mismo para que
   createSessionCookie/verifyIdToken puedan firmar vía la IAM API — ver
   runbook #144, es un rol DISTINTO al roles/datastore.user que usa Firestore).
   En local, de `gcloud auth application-default login`.

   Espejo de apps/sitio/lib/firestore.ts: init LAZY + SINGLETON cacheado en
   `globalThis` para sobrevivir al hot-reload de Next. NUNCA importar desde un
   Client Component. */
import { getApps, initializeApp, applicationDefault, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT ?? "chirimoyo";

const globalForAdminAuth = globalThis as unknown as {
  __chirimoyoAdminAuth?: Auth;
};

function initApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];
  return initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID,
  });
}

/** Cliente Auth del Admin SDK, server-only (lazy singleton). */
export function getAdminAuth(): Auth {
  if (!globalForAdminAuth.__chirimoyoAdminAuth) {
    globalForAdminAuth.__chirimoyoAdminAuth = getAuth(initApp());
  }
  return globalForAdminAuth.__chirimoyoAdminAuth;
}
