import mongoose, { Document, Schema } from 'mongoose';
import type { EventCategory, EventStatus } from '@event-finder/shared';

// Re-export so server-side code can use these types without a second import path.
export type { EventCategory, EventStatus };

// TypeScript interface — describes the shape of an Event document.
// category and status use the shared enum types so this model and the client
// are guaranteed to agree on the allowed values at compile time.
export interface IEvent extends Document {
  title: string;
  description: string;
  category: EventCategory;
  creator: mongoose.Types.ObjectId; // Reference to the User who created the event
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude] — GeoJSON standard order
  };
  address: string; // Human-readable address, e.g. "ARC, UC Davis"
  startTime: Date;
  endTime: Date;
  maxAttendees: number;
  attendees: mongoose.Types.ObjectId[]; // References to Users who have joined
  isPublic: boolean;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      enum: ['sports', 'social', 'hiking', 'games', 'other'],
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User', // References the User collection
      required: true,
    },

    // GeoJSON Point — required format for MongoDB 2dsphere geospatial queries
    location: {
      type: {
        type: String,
        enum: ['Point'], // Must always be 'Point' for a single location
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude] — NOTE: longitude comes first in GeoJSON
        required: true,
      },
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    maxAttendees: {
      type: Number,
      required: true,
      min: 2,
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index — this is what enables "find events near me" queries in MongoDB
// Without this line, geospatial queries will fail
EventSchema.index({ location: '2dsphere' });

export default mongoose.model<IEvent>('Event', EventSchema);
