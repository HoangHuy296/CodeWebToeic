// Auth identity, profile data and temporary verification state for self-service email/phone changes.
import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { UserRole } from "../types/auth.js";

const { Schema, model, models } = mongoose;

interface PendingEmailChange {
  newEmail: string;
  verificationCode: string;
  expiresAt: Date;
}

interface PendingPhoneChange {
  newPhone: string;
  otpCode: string;
  expiresAt: Date;
}

export interface UserDocument {
  fullName: string;
  email: string;
  passwordHash: string;
  role: Exclude<UserRole, "guest">;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  isActive: boolean;
  refreshToken?: string;
  ownedCourseIds: Types.ObjectId[];
  pendingEmailChange?: PendingEmailChange;
  pendingPhoneChange?: PendingPhoneChange;
}

export type UserHydratedDocument = HydratedDocument<UserDocument>;
type UserModel = Model<UserDocument>;

const pendingEmailChangeSchema = new Schema<PendingEmailChange>(
  {
    newEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    verificationCode: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false },
);

const pendingPhoneChangeSchema = new Schema<PendingPhoneChange>(
  {
    newPhone: {
      type: String,
      required: true,
      trim: true,
    },
    otpCode: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false },
);

const userSchema = new Schema<UserDocument, UserModel>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
      index: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    ownedCourseIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    pendingEmailChange: {
      type: pendingEmailChangeSchema,
    },
    pendingPhoneChange: {
      type: pendingPhoneChangeSchema,
    },
  },
  {
    timestamps: true,
  },
);

export const User =
  (models.User as UserModel) ||
  model<UserDocument, UserModel>("User", userSchema);
