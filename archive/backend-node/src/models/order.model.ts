// Revenue-facing purchase record used by admin stats, charts and future payment reconciliation.
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';

const { Schema, model, models } = mongoose;

export interface OrderDocument {
  student: Types.ObjectId;
  course: Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'bank-transfer' | 'card' | 'cash' | 'momo' | 'zalopay' | 'other';
  paymentProvider?: string;
  transactionId?: string;
  paidAt?: Date;
}

export type OrderHydratedDocument = HydratedDocument<OrderDocument>;
type OrderModel = Model<OrderDocument>;

const orderSchema = new Schema<OrderDocument, OrderModel>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'VND',
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['bank-transfer', 'card', 'cash', 'momo', 'zalopay', 'other'],
      default: 'bank-transfer',
    },
    paymentProvider: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
      index: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ student: 1, course: 1, createdAt: -1 });

export const Order =
  (models.Order as OrderModel) || model<OrderDocument, OrderModel>('Order', orderSchema);
