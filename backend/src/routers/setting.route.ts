import express from 'express';

import { jwtVerify } from '../controllers/auth.controller';
import { changePassword } from '../controllers/setting.controller';

const settingRoute = express.Router();

settingRoute.post('/change-password', jwtVerify, changePassword);

export default settingRoute;
