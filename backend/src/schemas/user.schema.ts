/* eslint-disable camelcase */
import { Schema, model } from 'mongoose';
import type { UserSchemaType } from '../utils/types.util';

const profile_imgs_name_list = [
  'Garfield',
  'Tinkerbell',
  'Annie',
  'Loki',
  'Cleo',
  'Angel',
  'Bob',
  'Mia',
  'Coco',
  'Gracie',
  'Bear',
  'Bella',
  'Abby',
  'Harley',
  'Cali',
  'Leo',
  'Luna',
  'Jack',
  'Felix',
  'Kiki',
];

const profile_imgs_collections_list = ['notionists-neutral', 'adventurer-neutral', 'fun-emoji'];

export const userSchema = new Schema(
  {
    personal_info: {
      fullname: { type: String, lowercase: true, require: true, minLength: [3, 'fullname must be 3 letters long'] },
      email: { type: String, require: true, lowercase: true, unique: true },
      password: { type: String },
      username: { type: String, minLength: [3, 'Username must be 3 letters long'], unique: true },
      bio: { type: String, maxLength: [200, 'Bio should not be more than 200'], default: '' },
      profile_img: {
        type: String,
        default: () =>
          `https://api.dicebear.com/6.x/${
            profile_imgs_collections_list[Math.floor(Math.random() * profile_imgs_collections_list.length)]
          }/svg?seed=${profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)]}`,
      },
    },
    social_links: {
      youtube: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    account_info: {
      total_posts: { type: Number, default: 0 },
      total_reads: { type: Number, default: 0 },
    },
    google_auth: { type: Boolean, default: false },
    blogs: { type: [Schema.Types.ObjectId], ref: 'blogs', default: [] },
  },
  { timestamps: true },
);

// export type UserSchemaType = InferSchemaType<typeof userSchema>;

export default model<UserSchemaType>('User', userSchema);
