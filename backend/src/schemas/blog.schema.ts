import { InferSchemaType, Schema, model } from 'mongoose';
import env from '../utils/validateEnv.util';

const blogSchema = new Schema(
  {
    blog_id: { type: String, require: true, unique: true },
    title: { type: String, require: true },
    banner: { type: String },
    des: { type: String, maxLength: env.BLOG_DES_CHAR_LIMIT },
    content: { type: [] },
    tags: { type: [String] },
    author: { type: Schema.Types.ObjectId, require: true, ref: 'users' },
    activity: {
      total_likes: { type: Number, default: 0 },
      total_comments: { type: Number, default: 0 },
      total_reads: { type: Number, default: 0 },
      total_parent_comments: { type: Number, default: 0 },
    },
    comments: { type: [Schema.Types.ObjectId], ref: 'comments' },
    draft: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: 'publishedAt',
    },
  },
);

type BlogSchemaType = InferSchemaType<typeof blogSchema>;

export default model<BlogSchemaType>('blogs', blogSchema);
