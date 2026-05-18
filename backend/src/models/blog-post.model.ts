// Editorial content model used by public blog pages and admin post management.
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';

const { Schema, model, models } = mongoose;

export interface BlogPostDocument {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  author: Types.ObjectId;
  status: 'draft' | 'published' | 'archived';
  seoDescription?: string;
  publishedAt?: Date;
}

export type BlogPostHydratedDocument = HydratedDocument<BlogPostDocument>;
type BlogPostModel = Model<BlogPostDocument>;

const blogPostSchema = new Schema<BlogPostDocument, BlogPostModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 320,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 180,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const BlogPost =
  (models.BlogPost as BlogPostModel) || model<BlogPostDocument, BlogPostModel>('BlogPost', blogPostSchema);
