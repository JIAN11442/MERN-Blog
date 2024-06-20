import express from 'express';

import { jwtVerify } from '../controllers/auth.controller';
import { getNotifications } from '../controllers/dashboard.controller';

const dashboardRoute = express.Router();

dashboardRoute.get('/get-notifications', jwtVerify, getNotifications);

export default dashboardRoute;
