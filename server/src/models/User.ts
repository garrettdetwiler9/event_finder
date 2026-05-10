import mongoose, { Document, Schema } from 'mongoose';
import type { IUser as IUserResponse } from '../shared';

// IUserResponse (from shared/types) is the API wire format — strings for IDs and dates.
// IUser below is the Mongoose document type — ObjectId for refs, Date for timestamps.
export interface IUser
  extends Document, Omit<IUserResponse, '_id' | 'friends' | 'createdAt' | 'updatedAt'> {
  friends: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema — enforces the shape when saving to MongoDB
const UserSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true, // No two users can share the same Firebase UID
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    avatarUrl: {
      type: String,
    },
    accountType: {
      type: String,
      enum: ['user', 'business', 'org'],
      default: 'user',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // Tells Mongoose this references the User collection
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default mongoose.model<IUser>('User', UserSchema);
