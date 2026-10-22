const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let firebaseAdminInitialized = false;

const initFirebaseAdmin = () => {
  if (firebaseAdminInitialized || (Array.isArray(admin.apps) && admin.apps.length > 0)) {
    firebaseAdminInitialized = true;
    return admin;
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
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
          projectId: projectId || credentials.project_id,
        });
        firebaseAdminInitialized = true;
        console.log('[Firebase Admin] Initialized successfully with Service Account Key.');
        return admin;
      }
    }

    if (projectId) {
      admin.initializeApp({
        projectId,
      });
      firebaseAdminInitialized = true;
      console.log(`[Firebase Admin] Initialized with Project ID: ${projectId}`);
      return admin;
    }

    console.log('[Firebase Admin] No Service Account Key or Project ID found. Fallback token verification enabled.');
  } catch (error) {
    console.warn(`[Firebase Admin Warning] Could not initialize Firebase Admin SDK: ${error.message}`);
  }

  return admin;
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
  if (firebaseAdminInitialized && Array.isArray(admin.apps) && admin.apps.length > 0) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
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

  // 2. Fallback: Verify via Google Tokeninfo endpoint
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (res.ok) {
      const tokenInfo = await res.json();
      if (tokenInfo.error_description || !tokenInfo.email) {
        throw new Error(tokenInfo.error_description || 'Invalid token claims.');
      }
      return {
        uid: tokenInfo.sub || tokenInfo.user_id,
        email: tokenInfo.email,
        name: tokenInfo.name || tokenInfo.email.split('@')[0],
        picture: tokenInfo.picture || null,
        emailVerified: tokenInfo.email_verified === 'true' || tokenInfo.email_verified === true,
      };
    }
  } catch (netErr) {
    console.warn(`[Google Tokeninfo] Verification endpoint error: ${netErr.message}`);
  }

  // 3. Fallback: Parse JWT payload safely if in development mode and check expiry
  if (process.env.NODE_ENV !== 'production') {
    try {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);
        const now = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < now) {
          throw new Error('Firebase token has expired.');
        }

        if (payload.email) {
          return {
            uid: payload.user_id || payload.sub || payload.uid,
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture || null,
            emailVerified: !!payload.email_verified,
          };
        }
      }
    } catch (parseErr) {
      throw new Error(`Invalid token format: ${parseErr.message}`);
    }
  }

  throw new Error('Failed to verify Firebase ID token. Please ensure your Firebase credentials are valid.');
};

module.exports = {
  admin,
  initFirebaseAdmin,
  verifyFirebaseIdToken,
};
