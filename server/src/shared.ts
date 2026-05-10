// Shared API wire-format types — kept here so the server builds correctly
// on Railway (which only deploys the server/ directory and cannot reach the
// repo-root shared/ folder). Keep this file in sync with shared/types/index.ts.

export type EventCategory = 'sports' | 'social' | 'hiking' | 'games' | 'other';
export type AccountType = 'user' | 'business' | 'org';
export type EventStatus = 'active' | 'cancelled' | 'completed';

export interface IUser {
  _id: string;
  firebaseUid: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  accountType: AccountType;
  verified: boolean;
  friends: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  creator: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude] — GeoJSON order
  };
  address: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  attendees: string[];
  isPublic: boolean;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  username: string;
  displayName: string;
  accountType?: AccountType;
}

export interface CreateEventData {
  title: string;
  description: string;
  category: EventCategory;
  location: { type: 'Point'; coordinates: [number, number] };
  address: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  isPublic?: boolean;
}
