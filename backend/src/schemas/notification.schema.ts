import { InferSchemaType, Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    type: { type: String, enum: ['like', 'comment', 'reply'], require: true },
    blog: { type: Schema.Types.ObjectId, require: true, ref: 'blogs' },
    notification_for: { type: Schema.Types.ObjectId, require: true, ref: 'users' },
    user: { type: Schema.Types.ObjectId, require: true, ref: 'users' },
    comment: { type: Schema.Types.ObjectId, ref: 'comments' },
    reply: { type: Schema.Types.ObjectId, ref: 'comments' },
    replied_on_comment: { type: Schema.Types.ObjectId, ref: 'comments' },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true },
);

type notificationSchemaType = InferSchemaType<typeof notificationSchema>;

export default model<notificationSchemaType>('Notification', notificationSchema);
