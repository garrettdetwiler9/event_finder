import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMe, type IUser } from '@/lib/api';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  userProfile: IUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await getMe();
      setUserProfile(profile);
    } catch (err: unknown) {
      if (err instanceof Error && (err as Error & { status?: number }).status === 404) {
        setUserProfile(null);
      } else {
        console.warn(
          'Failed to fetch user profile:',
          err instanceof Error ? err.message : String(err)
        );
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setFirebaseUser(user);
      if (user) {
        await fetchProfile();
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ firebaseUser, userProfile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
