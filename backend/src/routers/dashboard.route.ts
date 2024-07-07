import express from 'express';

import { jwtVerify } from '../controllers/auth.controller';
import {
  getNotificationsByUserId,
  getNotificationsByFilter,
  getCountOfNotificationsByFilter,
  removeNotificationById,
  updateRelateNotificationSeenStateByUser,
  updateNotificationSeenStateById,
  getUserWrittenBlogs,
  getCountOfUserWrittenBlogs,
} from '../controllers/dashboard.controller';

const dashboardRoute = express.Router();

dashboardRoute.get('/get-notifications-userId', jwtVerify, getNotificationsByUserId);

dashboardRoute.post('/notifications-filter-info', jwtVerify, getNotificationsByFilter);
dashboardRoute.post('/notifications-filter-count', jwtVerify, getCountOfNotificationsByFilter);
dashboardRoute.post('/remove-notification', jwtVerify, removeNotificationById);
dashboardRoute.post('/update-notifications-seen-user', jwtVerify, updateRelateNotificationSeenStateByUser);
dashboardRoute.post('/update-notifications-seen-id', jwtVerify, updateNotificationSeenStateById);

dashboardRoute.post('/get-user-written-blogs-info', jwtVerify, getUserWrittenBlogs);
dashboardRoute.post('/get-user-written-blogs-count', jwtVerify, getCountOfUserWrittenBlogs);

export default dashboardRoute;
