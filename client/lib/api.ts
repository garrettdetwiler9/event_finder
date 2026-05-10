import { auth } from '@/lib/firebase';
import type { IUser, IEvent, CreateUserData, CreateEventData } from '@shared/types';

export type { IUser, IEvent, CreateUserData, CreateEventData };

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

export async function getNearbyEvents(
  lat: number,
  lng: number,
  radiusMeters = 5000
): Promise<IEvent[]> {
  const res = await fetch(`${API_URL}/events/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Failed to fetch nearby events'), {
      status: res.status,
    });
  }
  return res.json();
}

export async function getEvents(params?: { category?: string }): Promise<IEvent[]> {
  const query = params?.category ? `?category=${params.category}` : '';
  const res = await fetch(`${API_URL}/events${query}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Failed to fetch events'), { status: res.status });
  }
  return res.json();
}

export async function createEvent(data: CreateEventData): Promise<IEvent> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Failed to create event'), { status: res.status });
  }
  return res.json();
}

export async function joinEvent(eventId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/events/${eventId}/join`, { method: 'POST', headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Failed to join event'), { status: res.status });
  }
}

export async function leaveEvent(eventId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/events/${eventId}/leave`, { method: 'DELETE', headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Failed to leave event'), { status: res.status });
  }
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
