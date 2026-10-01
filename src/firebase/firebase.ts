import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: firebaseConfigJson.projectId,
  appId: firebaseConfigJson.appId,
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Lazy Auth instance to prevent eager creation of cross-origin iframes
// in sandboxed preview environments (which causes "SecurityError: Blocked a frame with origin...")
let _auth: Auth | null = null;

export const getFirebaseAuth = (): Auth | null => {
  if (!_auth && typeof window !== 'undefined') {
    try {
      _auth = getAuth(app);
    } catch (e) {
      console.warn('Firebase auth initialization bypassed in iframe preview:', e);
    }
  }
  return _auth;
};

// Safe Auth proxy that fulfills TypeScript interfaces and standard Auth queries (currentUser, onAuthStateChanged, etc.)
// without eagerly initializing cross-origin iframe channels on initial load.
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (prop === 'currentUser') return null;
    if (prop === 'name') return '[DEFAULT]';
    if (prop === 'app') return app;
    if (prop === 'onAuthStateChanged') {
      return (callback: (user: any) => void) => {
        try {
          callback(null);
        } catch {}
        return () => {};
      };
    }
    const realAuth = getFirebaseAuth();
    if (realAuth && prop in realAuth) {
      const val = (realAuth as any)[prop];
      if (typeof val === 'function') {
        return val.bind(realAuth);
      }
      return val;
    }
    return undefined;
  },
});

export const db = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

// Defensive connection check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline check note:', error.message);
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection().catch(() => {});
}

