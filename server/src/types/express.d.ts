import { DecodedIdToken } from 'firebase-admin/auth';

// Extends Express's Request type to include the authenticated Firebase user.
// After auth middleware runs, req.user is guaranteed to be populated on protected routes.
declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}
