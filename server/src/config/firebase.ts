import admin from 'firebase-admin';

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
