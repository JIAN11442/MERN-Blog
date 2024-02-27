import express from 'express';

import { protectedRoute, authenticated, signin, signup } from '../controllers/users.controller';

const userRoute = express.Router();

userRoute.get('/', protectedRoute, authenticated);
userRoute.post('/signup', signup);
userRoute.post('/signin', signin);

export default userRoute;
