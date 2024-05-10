import { Schema, model } from 'mongoose';
import type { CommentSchemaType } from '../utils/types.util';

export const commentSchema = new Schema(
  {
    blog_id: { type: Schema.Types.ObjectId, require: true, ref: 'blogs' },
    blog_author: { type: Schema.Types.ObjectId, require: true, ref: 'blogs' },
    comment: { type: String, require: true },
    children: { type: [Schema.Types.ObjectId], ref: 'comments' },
    commented_by: { type: Schema.Types.ObjectId, require: true, ref: 'users' },
    isReply: { type: Boolean, default: false },
    parent: { type: Schema.Types.ObjectId, ref: 'comments' },
  },
  {
    timestamps: {
      createdAt: 'commentedAt',
    },
  },
);

// type CommentSchemaType = InferSchemaType<typeof commentSchema>;

export default model<CommentSchemaType>('Comment', commentSchema);
