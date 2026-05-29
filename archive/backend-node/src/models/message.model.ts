// Unified inbox model for public contact submissions and internal role-to-role messages.
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';

const { Schema, model, models } = mongoose;

export interface MessageDocument {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  content: string;
  summary?: string;
  status: 'unread' | 'read' | 'replied';
  messageType: 'contact' | 'internal';
  recipientRole?: 'student' | 'teacher' | 'admin';
  recipientUser?: Types.ObjectId;
  senderUser?: Types.ObjectId;
  readAt?: Date;
  repliedAt?: Date;
  assignedTo?: Types.ObjectId;
}

export type MessageHydratedDocument = HydratedDocument<MessageDocument>;
type MessageModel = Model<MessageDocument>;

const messageSchema = new Schema<MessageDocument, MessageModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 220,
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread',
      index: true,
    },
    messageType: {
      type: String,
      enum: ['contact', 'internal'],
      default: 'contact',
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
    },
    recipientUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    senderUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
    },
    repliedAt: {
      type: Date,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ messageType: 1, recipientUser: 1, createdAt: -1 });

export const Message =
  (models.Message as MessageModel) || model<MessageDocument, MessageModel>('Message', messageSchema);
