import { auth } from '@/lib/firebase';
import type { IUser, IEvent, CreateUserData, CreateEventData } from '@shared/types';

export type { IUser, IEvent, CreateUserData, CreateEventData };

declare const process: { env: Record<string, string | undefined> };
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getAuthHeaders(): Promise<{ Authorization: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

function apiError(body: { error?: string }, fallback: string, status: number): Error {
  return Object.assign(new Error(body.error ?? fallback), { status });
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: 'sports' | 'social' | 'hiking' | 'games' | 'other';
  creator: string | UserProfile;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  attendees: string[] | UserProfile[];
  isPublic: boolean;
  status: 'active' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileData {
  username: string;
  displayName: string;
  accountType?: 'user' | 'business' | 'org';
}

export interface UpdateProfileData {
  displayName?: string;
  avatarUrl?: string;
  accountType?: 'user' | 'business' | 'org';
}

export interface CreateEventData {
  title: string;
  description: string;
  category: 'sports' | 'social' | 'hiking' | 'games' | 'other';
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  isPublic?: boolean;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  category?: 'sports' | 'social' | 'hiking' | 'games' | 'other';
  address?: string;
  startTime?: string;
  endTime?: string;
  maxAttendees?: number;
  isPublic?: boolean;
  status?: 'active' | 'cancelled' | 'completed';
}

export interface GetEventsParams {
  category?: 'sports' | 'social' | 'hiking' | 'games' | 'other';
  status?: 'active' | 'cancelled' | 'completed';
}

export interface GetNearbyEventsParams {
  lat: number;
  lng: number;
  radius?: number; // meters, default on server is 5000
}

// ─── User endpoints ───────────────────────────────────────────────────────────

export async function getMe(): Promise<UserProfile> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/users/me`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to fetch profile', res.status);
  }
  return res.json();
}

export async function updateCurrentUserProfile(data: UpdateProfileData): Promise<UserProfile> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to update profile', res.status);
  }
  return res.json();
}

export async function getUserById(userId: string): Promise<UserProfile> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/users/${userId}`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to fetch user', res.status);
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
    throw apiError(body, 'Failed to create profile', res.status);
  }
  return res.json();
}

export async function addFriend(friendId: string): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/users/me/friends/${friendId}`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to add friend', res.status);
  }
  return res.json();
}

export async function removeFriend(friendId: string): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/users/me/friends/${friendId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to remove friend', res.status);
  }
  return res.json();
}

// ─── Event endpoints ──────────────────────────────────────────────────────────

export async function getEvents(params?: GetEventsParams): Promise<Event[]> {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  const res = await fetch(`${API_URL}/events${qs ? `?${qs}` : ''}`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to fetch events', res.status);
  }
  return res.json();
}

export async function getNearbyEvents(params: GetNearbyEventsParams): Promise<Event[]> {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
  });
  if (params.radius != null) query.set('radius', String(params.radius));
  const res = await fetch(`${API_URL}/events/nearby?${query}`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to fetch nearby events', res.status);
  }
  return res.json();
}

export async function getEvent(eventId: string): Promise<Event> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/events/${eventId}`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to fetch event', res.status);
  }
  return res.json();
}

export async function createEvent(data: CreateEventData): Promise<Event> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to create event', res.status);
  }
  return res.json();
}

export async function updateEvent(eventId: string, data: UpdateEventData): Promise<Event> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/events/${eventId}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to update event', res.status);
  }
  return res.json();
}

export async function deleteEvent(eventId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/events/${eventId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to delete event', res.status);
  }
}

export async function joinEvent(
  eventId: string
): Promise<{ message: string; attendeeCount: number }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/events/${eventId}/join`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to join event', res.status);
  }
  return res.json();
}

export async function leaveEvent(
  eventId: string
): Promise<{ message: string; attendeeCount: number }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/events/${eventId}/leave`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiError(body, 'Failed to leave event', res.status);
  }
  return res.json();
}
