import express from 'express';

import { jwtVerify } from '../controllers/auth.controller';
import {
  getNotificationsByUserId,
  getNotificationsByFilter,
  getCountOfNotificationsByFilter,
} from '../controllers/dashboard.controller';

const dashboardRoute = express.Router();

dashboardRoute.get('/get-notifications-userId', jwtVerify, getNotificationsByUserId);

dashboardRoute.post('/notifications-filter-info', jwtVerify, getNotificationsByFilter);
dashboardRoute.post('/notifications-filter-count', jwtVerify, getCountOfNotificationsByFilter);

export default dashboardRoute;
