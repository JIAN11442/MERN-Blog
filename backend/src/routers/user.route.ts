import express from 'express';

import {
  getRelatedUsersByQuery,
  getRelatedUsersByQueryCount,
  getAuthorProfileInfo,
} from '../controllers/user.controllers';

const userRoute = express.Router();

userRoute.post('/query-related-users', getRelatedUsersByQuery);
userRoute.post('/query-related-users-count', getRelatedUsersByQueryCount);
userRoute.post('/get-author-profile-info', getAuthorProfileInfo);

export default userRoute;
