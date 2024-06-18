import express from 'express';

import { jwtVerify } from '../controllers/auth.controller';
import { changePassword, updateUserAvatar } from '../controllers/setting.controller';

const settingRoute = express.Router();

settingRoute.post('/change-password', jwtVerify, changePassword);
settingRoute.post('/change-avatar', jwtVerify, updateUserAvatar);

export default settingRoute;
