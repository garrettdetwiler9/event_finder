import { auth } from '@/lib/firebase';
import type { IUser, CreateUserData } from '@shared/types';

export type { IUser, CreateUserData };

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getAuthHeaders(): Promise<{ Authorization: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getMe(): Promise<IUser> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/users/me`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Failed to fetch profile'), { status: res.status });
  }
  return res.json();
}

export async function createUserProfile(data: CreateUserData): Promise<IUser> {
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
