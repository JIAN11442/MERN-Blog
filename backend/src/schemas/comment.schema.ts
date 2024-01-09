import { InferSchemaType, Schema, model } from 'mongoose';

const commentSchema = new Schema(
  {
    blog_id: { type: Schema.Types.ObjectId, require: true, ref: 'blogs' },
    blog_author: { type: Schema.Types.ObjectId, require: true, ref: 'blogs' },
    comment: { type: String, require: true },
    children: { type: [Schema.Types.ObjectId], ref: 'comments' },
    commented_by: { type: Schema.Types.ObjectId, require: true, ref: 'users' },
    isReply: { type: Boolean },
    parent: { type: Schema.Types.ObjectId, ref: 'comments' },
  },
  { timestamps: true },
);

type CommentSchemaType = InferSchemaType<typeof commentSchema>;

export default model<CommentSchemaType>('Comment', commentSchema);
