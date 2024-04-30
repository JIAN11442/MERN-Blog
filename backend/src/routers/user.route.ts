import express from 'express';

import { getRelatedUsersByQuery, getRelatedUsersByQueryCount } from '../controllers/user.controllers';

const userRoute = express.Router();

userRoute.post('/query-related-users', getRelatedUsersByQuery);
userRoute.post('/query-related-users-count', getRelatedUsersByQueryCount);

export default userRoute;
