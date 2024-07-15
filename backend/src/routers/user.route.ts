import express from 'express';

import {
  getRelatedUsersByQuery,
  getRelatedUsersByQueryCount,
  getAuthorProfileInfo,
  checkUserIsFollowing,
  followAuthor,
  unfollowAuthor,
} from '../controllers/user.controllers';
import { jwtVerify } from '../controllers/auth.controller';

const userRoute = express.Router();

userRoute.post('/query-related-users', getRelatedUsersByQuery);
userRoute.post('/query-related-users-count', getRelatedUsersByQueryCount);

userRoute.post('/get-author-profile-info', getAuthorProfileInfo);

userRoute.post('/check-author-is-following-by-user', jwtVerify, checkUserIsFollowing);
userRoute.post('/follow-author', jwtVerify, followAuthor);
userRoute.post('/unfollow-author', jwtVerify, unfollowAuthor);

export default userRoute;
