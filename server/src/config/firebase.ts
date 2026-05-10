import admin from 'firebase-admin';

// Parses the Firebase private key from an environment variable robustly.
//
// Railway (and similar platforms) can store multiline values in several formats:
//   1. JSON-encoded string: "-----BEGIN RSA PRIVATE KEY-----\n..."
//      → JSON.parse() correctly decodes the escaped newlines
//   2. Raw string with literal \n characters: -----BEGIN...\n-----END...
//      → manual replace handles this
//   3. Raw string with real newlines (already correct)
//      → JSON.parse fails safely, replace is a no-op, key is used as-is
function parsePrivateKey(raw: string): string {
  try {
    // If Railway JSON-encoded the value (e.g. copied directly from the service account JSON),
    // JSON.parse will correctly handle all the escape sequences including \n.
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
  } catch {
    // Not JSON-encoded — fall through to manual replacement
  }
  // Handle literal \n sequences that Railway sometimes introduces
  return raw.replace(/\\n/g, '\n');
}

// Only initialize once — prevents errors if this module is imported multiple times
if (!admin.apps.length) {
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !rawPrivateKey) {
    throw new Error(
      'Missing Firebase Admin environment variables. ' +
        'Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: parsePrivateKey(rawPrivateKey),
    }),
  });
}

export default admin;
