import { auth } from '@/lib/firebase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getAuthHeaders(): Promise<{ Authorization: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Request failed'), { status: res.status });
  }
  return res.json();
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
  birthdate?: string;
  interests: string[];
  friends: FriendProfile[] | string[];
  checkins: string[];
  invites: UserInvite[];
  pushToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FriendProfile {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  accountType: 'user' | 'business' | 'org';
}

export interface UserInvite {
  eventId: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  event?: EventSummary;
}

export interface EventLocation {
  type: 'Point';
  coordinates: [number, number];
}

export type EventCategory = 'sports' | 'social' | 'hiking' | 'games' | 'food' | 'music' | 'leisure' | 'other';
export type EventStatus = 'upcoming' | 'active' | 'ongoing' | 'cancelled' | 'completed';

export interface EventRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly';
  until: string;
  parentEventId?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  creator: FriendProfile;
  location: EventLocation;
  address: string;
  startTime: string;
  endTime: string;
  maxAttendees?: number;
  ageMin?: number;
  ageMax?: number;
  attendees: FriendProfile[];
  checkins: FriendProfile[];
  invites: EventInvite[];
  isPublic: boolean;
  status: EventStatus;
  views: number;
  checkinToken?: string;
  recurrence?: EventRecurrence;
  createdAt: string;
  updatedAt: string;
}

export interface EventSummary {
  _id: string;
  title: string;
  startTime: string;
  address: string;
  category: EventCategory;
  creator?: FriendProfile;
}

export interface EventInvite {
  userId: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface EventAnalytics {
  views: number;
  rsvpCount: number;
  checkinCount: number;
  attendees: FriendProfile[];
  checkins: FriendProfile[];
  conversionRate: number;
}

export interface CreateEventData {
  title: string;
  description: string;
  category: EventCategory;
  location: EventLocation;
  address: string;
  startTime: string;
  endTime: string;
  maxAttendees?: number;
  ageMin?: number;
  ageMax?: number;
  isPublic?: boolean;
  recurrence?: EventRecurrence;
}

export interface CreateProfileData {
  username: string;
  displayName: string;
  accountType?: 'user' | 'business' | 'org';
  birthdate?: string;
}

// ─── User APIs ────────────────────────────────────────────────────────────────

export async function getMe(): Promise<UserProfile> {
  return apiFetch('/users/me');
}

export async function createUserProfile(data: CreateProfileData): Promise<UserProfile> {
  return apiFetch('/users', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateMe(data: Partial<{ displayName: string; avatarUrl: string; accountType: string; birthdate: string; interests: string[] }>): Promise<UserProfile> {
  return apiFetch('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
}

export async function getUser(id: string): Promise<FriendProfile> {
  return apiFetch(`/users/${id}`);
}

export async function searchUsers(q: string): Promise<FriendProfile[]> {
  return apiFetch(`/users/search?q=${encodeURIComponent(q)}`);
}

export async function addFriend(friendId: string): Promise<void> {
  await apiFetch(`/users/me/friends/${friendId}`, { method: 'POST' });
}

export async function removeFriend(friendId: string): Promise<void> {
  await apiFetch(`/users/me/friends/${friendId}`, { method: 'DELETE' });
}

export async function registerPushToken(pushToken: string): Promise<void> {
  await apiFetch('/users/me/push-token', { method: 'POST', body: JSON.stringify({ pushToken }) });
}

export async function getMyInvites(): Promise<UserInvite[]> {
  return apiFetch('/users/me/invites');
}

export async function respondToInvite(eventId: string, status: 'accepted' | 'declined'): Promise<void> {
  await apiFetch(`/users/me/invites/${eventId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

// ─── Event APIs ───────────────────────────────────────────────────────────────

export async function getNearbyEvents(lat: number, lng: number, radius?: number, userId?: string): Promise<Event[]> {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (radius) params.set('radius', String(radius));
  if (userId) params.set('userId', userId);
  return apiFetch(`/events/nearby?${params}`);
}

export async function getEvents(params?: { category?: string; status?: string; userId?: string }): Promise<Event[]> {
  const q = new URLSearchParams(params as Record<string, string>);
  return apiFetch(`/events?${q}`);
}

export async function getEvent(id: string): Promise<Event> {
  return apiFetch(`/events/${id}`);
}

export async function getMyEvents(): Promise<Event[]> {
  return apiFetch('/events/mine');
}

export async function createEvent(data: CreateEventData): Promise<Event> {
  return apiFetch('/events', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateEvent(id: string, data: Partial<CreateEventData & { status: EventStatus }>): Promise<Event> {
  return apiFetch(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteEvent(id: string): Promise<void> {
  await apiFetch(`/events/${id}`, { method: 'DELETE' });
}

export async function rsvpEvent(id: string): Promise<{ rsvpCount: number }> {
  return apiFetch(`/events/${id}/join`, { method: 'POST' });
}

export async function cancelRsvp(id: string): Promise<{ rsvpCount: number }> {
  return apiFetch(`/events/${id}/leave`, { method: 'DELETE' });
}

export async function checkinWithToken(eventId: string, token: string): Promise<{ checkinCount: number }> {
  return apiFetch(`/events/${eventId}/checkin`, { method: 'POST', body: JSON.stringify({ token }) });
}

export async function checkinWithLocation(eventId: string, lat: number, lng: number): Promise<{ checkinCount: number }> {
  return apiFetch(`/events/${eventId}/checkin`, { method: 'POST', body: JSON.stringify({ lat, lng }) });
}

export async function getCheckinQR(eventId: string): Promise<{ eventId: string; token: string }> {
  return apiFetch(`/events/${eventId}/checkin-qr`);
}

export async function getEventAnalytics(eventId: string): Promise<EventAnalytics> {
  return apiFetch(`/events/${eventId}/analytics`);
}

export async function inviteFriends(eventId: string, friendIds: string[]): Promise<void> {
  await apiFetch(`/events/${eventId}/invite`, { method: 'POST', body: JSON.stringify({ friendIds }) });
}
