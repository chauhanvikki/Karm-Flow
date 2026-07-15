import mongoose, { Document, Schema } from 'mongoose';

// Define the User Role types to match our frontend
export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional because OAuth users might not have a password
  role: UserRole;
  companyName?: string; // Only required for recruiters
  phone?: string;
  skills?: string; // comma separated list
  
  // OAuth fields for future implementation
  googleId?: string;
  authProvider: 'local' | 'google';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        // Password is required only if the user is using local authentication
        return this.authProvider === 'local';
      },
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['candidate', 'recruiter', 'admin'],
      default: 'candidate',
      required: true,
    },
    companyName: {
      type: String,
      required: function (this: IUser) {
        // Company name is required if the user is a recruiter
        return this.role === 'recruiter';
      },
    },
    phone: {
      type: String,
    },
    skills: {
      type: String,
    },
    
    // --- OAuth Fields (For later) ---
    googleId: {
      type: String,
      sparse: true, // Allows multiple nulls but ensures uniqueness if it exists
      unique: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Prevent mongoose from recompiling the model if it already exists
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
