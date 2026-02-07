import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';

let _auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    _auth = admin.auth();
  }
  return _auth;
}

// Backward compat — lazy proxy
export const firebaseAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    return (getFirebaseAuth() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
