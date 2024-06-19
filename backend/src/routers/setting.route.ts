import express from 'express';

import { jwtVerify } from '../controllers/auth.controller';
import { changePassword, updateUserAvatar, updateUserProfile } from '../controllers/setting.controller';

const settingRoute = express.Router();

settingRoute.post('/change-password', jwtVerify, changePassword);
settingRoute.post('/change-avatar', jwtVerify, updateUserAvatar);
settingRoute.post('/change-profile', jwtVerify, updateUserProfile);

export default settingRoute;
