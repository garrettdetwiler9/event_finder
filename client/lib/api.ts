import { auth } from '@/lib/firebase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getAuthHeaders(): Promise<{ Authorization: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export interface UserProfile {
  _id: string;
  firebaseUid: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  accountType: 'user' | 'business' | 'org';
  verified: boolean;
  friends: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileData {
  username: string;
  displayName: string;
  accountType?: 'user' | 'business' | 'org';
}

export async function getMe(): Promise<UserProfile> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/users/me`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Failed to fetch profile'), { status: res.status });
  }
  return res.json();
}

export async function createUserProfile(data: CreateProfileData): Promise<UserProfile> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Failed to create profile'), {
      status: res.status,
    });
  }
  return res.json();
}
