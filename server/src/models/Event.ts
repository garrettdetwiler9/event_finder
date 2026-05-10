import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IEventInvite {
  userId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined';
}

export interface IRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly';
  until: Date;
  parentEventId?: mongoose.Types.ObjectId;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  category: 'sports' | 'social' | 'hiking' | 'games' | 'food' | 'music' | 'leisure' | 'other';
  creator: mongoose.Types.ObjectId;
  location: { type: 'Point'; coordinates: [number, number] };
  address: string;
  startTime: Date;
  endTime: Date;
  maxAttendees?: number;
  ageMin?: number;
  ageMax?: number;
  attendees: mongoose.Types.ObjectId[];
  checkins: mongoose.Types.ObjectId[];
  invites: IEventInvite[];
  isPublic: boolean;
  status: 'upcoming' | 'active' | 'ongoing' | 'cancelled' | 'completed';
  views: number;
  checkinToken: string;
  recurrence?: IRecurrence;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ['sports', 'social', 'hiking', 'games', 'food', 'music', 'leisure', 'other'],
      required: true,
    },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    maxAttendees: { type: Number, min: 1 },
    ageMin: { type: Number, min: 0 },
    ageMax: { type: Number, min: 0 },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    checkins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    invites: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
      },
    ],
    isPublic: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'ongoing', 'cancelled', 'completed'],
      default: 'active',
    },
    views: { type: Number, default: 0 },
    checkinToken: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    recurrence: {
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
      until: { type: Date },
      parentEventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    },
  },
  { timestamps: true }
);

EventSchema.index({ location: '2dsphere' });

export default mongoose.model<IEvent>('Event', EventSchema);
