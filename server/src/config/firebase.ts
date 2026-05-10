import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Ensure .env is loaded before reading env vars. This is necessary because
// TypeScript hoists all import statements to the top of the compiled output,
// meaning firebase.ts is fully executed before dotenv.config() runs in index.ts.
// Calling it here makes this module self-sufficient regardless of import order.
// dotenv.config() is safe to call multiple times — it will not overwrite
// environment variables that are already set (e.g. on Railway in production).
dotenv.config();

// We store the entire Firebase service account JSON as a base64-encoded string
// in a single Railway environment variable (FIREBASE_SERVICE_ACCOUNT_BASE64).
//
// This avoids all the multiline / newline-escaping issues that Railway introduces
// when storing the private key directly as a string.
//
// To generate the value locally:
//   Mac/Linux: base64 -i service-account.json | tr -d '\n'
//   Windows:   [Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
//
// Paste the output into Railway as FIREBASE_SERVICE_ACCOUNT_BASE64.

// Only initialize once — prevents errors if this module is imported multiple times
if (!admin.apps.length) {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!encoded) {
    throw new Error(
      'Missing FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable. ' +
        'Base64-encode your Firebase service account JSON and set it in Railway.'
    );
  }

  const serviceAccount = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
