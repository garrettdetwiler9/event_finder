import mongoose, { Document, Schema } from 'mongoose';
import type { IEvent as IEventResponse } from '../shared';

// IEventResponse (from shared/types) is the API wire format — strings for IDs and dates.
// IEvent below is the Mongoose document type — ObjectId for refs, Date for timestamps.
export interface IEvent
  extends
    Document,
    Omit<
      IEventResponse,
      '_id' | 'creator' | 'attendees' | 'startTime' | 'endTime' | 'createdAt' | 'updatedAt'
    > {
  creator: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
  startTime: Date;
  endTime: Date;
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
