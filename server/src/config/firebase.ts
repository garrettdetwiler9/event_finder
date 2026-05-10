import admin from 'firebase-admin';

// Only initialize once — this prevents errors if the module is imported multiple times
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error(
      'Missing Firebase Admin environment variables. ' +
        'Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Railway stores the private key as a single-line string with literal \n characters.
      // We replace them with real newlines so the key is valid for Firebase Admin.
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

export default admin;
