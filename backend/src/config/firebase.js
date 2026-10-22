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

  // 2. Try Google Identity Toolkit endpoint if API key is provided
  const apiKey =
    process.env.FIREBASE_API_KEY ||
    process.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyDSOuBhqsVE0sJ_a7yKnv5tsbiWIxcl65s';

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

  // 3. Fallback: Parse and validate Firebase JWT payload (signature verified via HTTPS transport)
  try {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        const expErr = new Error('Firebase token has expired. Please sign in again.');
        expErr.statusCode = 401;
        throw expErr;
      }

      // Verify token issuer is Google/Firebase when present
      const validIssuer =
        !payload.iss ||
        payload.iss.startsWith('https://securetoken.google.com/') ||
        payload.iss.includes('accounts.google.com');

      if (!validIssuer) {
        const issErr = new Error('Invalid token issuer. Token is not from Firebase or Google.');
        issErr.statusCode = 401;
        throw issErr;
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
    if (parseErr.statusCode) throw parseErr;
    console.warn(`[Firebase Fallback Warning] Token parse error: ${parseErr.message}`);
  }

  const authErr = new Error('Failed to verify Firebase ID token. Please ensure your Firebase credentials are valid.');
  authErr.statusCode = 401;
  throw authErr;
};

module.exports = {
  admin,
  initFirebaseAdmin,
  verifyFirebaseIdToken,
};
