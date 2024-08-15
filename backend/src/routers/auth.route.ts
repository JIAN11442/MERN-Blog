import express from 'express';

import { jwtVerify, jwtAuthentication, signin, signup, googleAuth } from '../controllers/auth.controller';

const authRoute = express.Router();

// prefix: /auth
authRoute.get('/authentication', jwtVerify, jwtAuthentication);
authRoute.post('/signup', signup);
authRoute.post('/signin', signin);
authRoute.post('/google-auth', googleAuth);

export default authRoute;
