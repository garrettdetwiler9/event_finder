import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';

// Protects routes by verifying the Firebase ID token sent in the Authorization header.
//
// Usage: add `authenticate` as middleware to any route that requires a logged-in user.
//   router.post('/events', authenticate, createEvent);
//
// The Expo client must send the token like this:
//   Authorization: Bearer <firebase-id-token>
//
// After this middleware runs, req.user contains the decoded Firebase token,
// including req.user.uid (the user's Firebase UID).

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Verify the token with Firebase Admin — checks signature, expiry, and project
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
