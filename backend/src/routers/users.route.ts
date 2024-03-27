import express from 'express';

import { jwtVerify, jwtAuthentication, signin, signup, googleAuth } from '../controllers/users.controller';

const userRoute = express.Router();

userRoute.get('/authentication', jwtVerify, jwtAuthentication);
userRoute.post('/signup', signup);
userRoute.post('/signin', signin);
userRoute.post('/google-auth', googleAuth);

export default userRoute;
