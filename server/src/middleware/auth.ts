import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';

// Protects routes by verifying the Firebase ID token sent in the Authorization header.
//
// Usage: add `authenticate` as middleware to any route that requires a logged-in user.
//   router.post('/events', authenticate, createEvent);
//
// The Expo app must send the token like this:
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

  // Check that the Authorization header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Verify the token with Firebase Admin — this checks signature, expiry, and project
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // Attach the decoded user to the request for downstream handlers
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
