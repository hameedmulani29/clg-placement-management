import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

/**
 * Checks whether required Firebase Client keys are present in Vite env
 */
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
};

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
  } catch (error) {
    console.warn('[Firebase Client] Initialization warning:', error.message);
  }
}

/**
 * Trigger Google Sign-in popup via Firebase
 * @returns {Promise<{ user: any, idToken: string }>}
 */
export const signInWithGooglePopup = async () => {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured yet. Please set your VITE_FIREBASE_* environment variables in frontend/.env (refer to README.md).'
    );
  }

  if (!auth || !googleProvider) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return {
      user: result.user,
      idToken,
    };
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') {
      throw new Error('Google sign-in window was closed before completing authentication.');
    }
    if (err.code === 'auth/cancelled-popup-request') {
      throw new Error('Previous sign-in popup was cancelled.');
    }
    if (err.code === 'auth/unauthorized-domain') {
      throw new Error(
        `This domain is not authorized in your Firebase console. Please add '${window.location.hostname}' to Firebase Authentication -> Settings -> Authorized domains.`
      );
    }
    throw err;
  }
};

/**
 * Sign out of Firebase if initialized
 */
export const firebaseSignOut = async () => {
  if (auth) {
    try {
      await fbSignOut(auth);
    } catch (_) {}
  }
};

export { auth, googleProvider };
export default app;
