import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface — describes the shape of a User document.
// Note: the canonical definition of AccountType lives in shared/types/index.d.ts.
// The inline literal here is intentional — Railway builds the server in isolation
// (rootDirectory: server/) so the shared/ directory is not available at build time.
export interface IUser extends Document {
  firebaseUid: string; // Links this MongoDB record to the Firebase Auth user
  username: string;
  displayName: string;
  avatarUrl?: string; // Optional profile picture URL
  accountType: 'user' | 'business' | 'org';
  verified: boolean; // For business/org badge
  friends: mongoose.Types.ObjectId[]; // References to other User documents
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
