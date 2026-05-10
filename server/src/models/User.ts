import mongoose, { Document, Schema } from 'mongoose';

export interface IUserInvite {
  eventId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface IUser extends Document {
  firebaseUid: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  accountType: 'user' | 'business' | 'org';
  verified: boolean;
  birthdate?: Date;
  interests: string[];
  friends: mongoose.Types.ObjectId[];
  checkins: mongoose.Types.ObjectId[];
  invites: IUserInvite[];
  pushToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    displayName: { type: String, required: true, trim: true, maxlength: 50 },
    avatarUrl: { type: String },
    accountType: { type: String, enum: ['user', 'business', 'org'], default: 'user' },
    verified: { type: Boolean, default: false },
    birthdate: { type: Date },
    interests: [{ type: String }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    checkins: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    invites: [
      {
        eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
        invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    pushToken: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
