jest.mock('firebase-admin', () => ({
  apps: [],
  credential: { cert: jest.fn() },
  initializeApp: jest.fn(),
}));

const { verifyFirebaseIdToken } = require('../src/config/firebase');

describe('Firebase ID token verification', () => {
  test('rejects a token with an unverified payload', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        uid: 'forged-user',
        email: 'forged@example.com',
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'https://securetoken.google.com/example',
      })
    ).toString('base64url');

    await expect(verifyFirebaseIdToken(`${header}.${payload}.`)).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
