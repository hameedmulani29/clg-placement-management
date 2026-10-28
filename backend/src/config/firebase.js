const { cert, getApp, getApps, initializeApp } = require('firebase-admin/app');
const fs = require('fs');
const path = require('path');

let firebaseAdminInitialized = false;
let firebaseApp = null;

const initFirebaseAdmin = () => {
  const apps = getApps();
  if (firebaseAdminInitialized || apps.length > 0) {
    firebaseAdminInitialized = true;
    firebaseApp = apps[0] || getApp();
    return firebaseApp;
  }

  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (serviceAccountKey) {
      let credentials = null;

      // Check if it's a file path
      const resolvedPath = path.isAbsolute(serviceAccountKey)
        ? serviceAccountKey
        : path.resolve(process.cwd(), serviceAccountKey);

      if (fs.existsSync(resolvedPath)) {
        const fileContent = fs.readFileSync(resolvedPath, 'utf8');
        credentials = JSON.parse(fileContent);
      } else {
        // Assume it's a raw JSON string
        try {
          credentials = JSON.parse(serviceAccountKey);
        } catch (jsonErr) {
          console.warn('[Firebase Admin] Service account key is neither a valid file path nor valid JSON string.');
        }
      }

      if (credentials) {
        firebaseApp = initializeApp({
          credential: cert(credentials),
          projectId: projectId || credentials.project_id,
        });
        firebaseAdminInitialized = true;
        console.log('[Firebase Admin] Initialized successfully with Service Account Key.');
        return firebaseApp;
      }
    }

    if (projectId) {
      firebaseApp = initializeApp({
        projectId,
      });
      firebaseAdminInitialized = true;
      console.log(`[Firebase Admin] Initialized with Project ID: ${projectId}`);
      return firebaseApp;
    }

    console.log('[Firebase Admin] No Service Account Key or Project ID found. Fallback token verification enabled.');
  } catch (error) {
    console.warn(`[Firebase Admin Warning] Could not initialize Firebase Admin SDK: ${error.message}`);
  }

  return null;
};

// Attempt initialization on startup
initFirebaseAdmin();

/**
 * Verify Firebase ID token
 * Uses Firebase Admin SDK if available, or falls back to Google's public token verification endpoint.
 *
 * @param {string} idToken - The Firebase ID token received from the frontend
 * @returns {Promise<{ uid: string, email: string, name: string, picture: string, emailVerified: boolean }>}
 */
const verifyFirebaseIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing or invalid Firebase ID token.');
  }

  // 1. Try Firebase Admin SDK verification if configured
  if (firebaseAdminInitialized && firebaseApp) {
    try {
      const { getAuth } = require('firebase-admin/auth');
      const decoded = await getAuth(firebaseApp).verifyIdToken(idToken);
      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.displayName || (decoded.email ? decoded.email.split('@')[0] : 'User'),
        picture: decoded.picture || null,
        emailVerified: !!decoded.email_verified,
      };
    } catch (adminErr) {
      // If admin verification fails, and no explicit service account is loaded, allow fallback
      console.warn(`[Firebase Admin] Token verification failed via Admin SDK (${adminErr.message}), trying fallback.`);
    }
  }

  // 2. Try Google Identity Toolkit endpoint if an API key is configured
  const apiKey =
    process.env.FIREBASE_API_KEY ||
    process.env.VITE_FIREBASE_API_KEY;

  if (apiKey && process.env.NODE_ENV !== 'test') {
    try {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          const u = data.users[0];
          return {
            uid: u.localId,
            email: u.email,
            name: u.displayName || (u.email ? u.email.split('@')[0] : 'User'),
            picture: u.photoUrl || null,
            emailVerified: !!u.emailVerified,
          };
        }
      }
    } catch (toolkitErr) {
      console.warn(`[Google Identity Toolkit] Endpoint error: ${toolkitErr.message}`);
    }
  }

  const authErr = new Error('Failed to verify Firebase ID token. Please ensure your Firebase credentials are valid.');
  authErr.statusCode = 401;
  throw authErr;
};

module.exports = {
  initFirebaseAdmin,
  verifyFirebaseIdToken,
};
