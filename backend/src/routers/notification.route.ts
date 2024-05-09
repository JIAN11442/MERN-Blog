import express from 'express';

import { jwtVerify } from '../controllers/auth.controller';
import { getLikeStatusByUserId, updateTotalLikesByUserId } from '../controllers/notification.controller';

const notificationRoute = express.Router();

notificationRoute.post('/like-blog', jwtVerify, updateTotalLikesByUserId);
notificationRoute.post('/get-user-like-status', jwtVerify, getLikeStatusByUserId);

export default notificationRoute;
