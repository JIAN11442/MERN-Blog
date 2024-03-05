import express from 'express';

import { protectedRoute, jwtAuthentication, signin, signup } from '../controllers/users.controller';

const userRoute = express.Router();

userRoute.get('/authentication', protectedRoute, jwtAuthentication);
userRoute.post('/signup', signup);
userRoute.post('/signin', signin);

export default userRoute;
