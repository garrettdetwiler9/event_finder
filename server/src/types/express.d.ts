import { DecodedIdToken } from 'firebase-admin/auth';

// Extends Express's Request type to include the authenticated Firebase user.
// After the authenticate middleware runs, req.user is guaranteed to be populated
// on any protected route.
declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}
