// ─── Shared enum types ────────────────────────────────────────────────────────
// These are the single source of truth for every union literal used on both the
// server (Mongoose model enums) and the client (forms, filters, display logic).
// Change a value here and the TypeScript compiler will surface every place that
// needs updating across the whole monorepo.

export type EventCategory = 'sports' | 'social' | 'hiking' | 'games' | 'other';
export type EventStatus = 'active' | 'cancelled' | 'completed';
export type AccountType = 'user' | 'business' | 'org';

// ─── User shapes ──────────────────────────────────────────────────────────────

// Minimal populated user — returned nested inside events as creator / attendees.
// The server populates these fields via .populate('creator', 'username displayName avatarUrl').
export interface IUserPublic {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

// Full user profile — returned by GET /users/me and GET /users/:id.
// ObjectId references (friends) are serialised to strings over JSON.
export interface IUserData extends IUserPublic {
  accountType: AccountType;
  verified: boolean;
  friends: IUserPublic[];
  createdAt: string;
  updatedAt: string;
}

// ─── Event shape ──────────────────────────────────────────────────────────────

// Matches what the server returns from GET /events, GET /events/:id, etc.
// creator and attendees are populated objects, not raw ObjectId strings.
export interface IEventData {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  creator: IUserPublic;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude] — GeoJSON order
  };
  address: string;
  startTime: string; // ISO 8601 string — convert to Date on the client as needed
  endTime: string;
  maxAttendees: number;
  attendees: IUserPublic[];
  isPublic: boolean;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Request body types ───────────────────────────────────────────────────────
// Used by the API service layer (Step 4) to type the arguments passed to
// createEvent(), createUserProfile(), etc. before they hit the network.

export interface CreateEventBody {
  title: string;
  description: string;
  category: EventCategory;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  isPublic?: boolean;
}

export interface CreateUserBody {
  username: string;
  displayName: string;
  accountType?: AccountType;
}

export interface UpdateUserBody {
  displayName?: string;
  avatarUrl?: string;
  accountType?: AccountType;
}

export interface UpdateEventBody {
  title?: string;
  description?: string;
  category?: EventCategory;
  address?: string;
  startTime?: string;
  endTime?: string;
  maxAttendees?: number;
  isPublic?: boolean;
  status?: EventStatus;
}
