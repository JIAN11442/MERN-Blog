import express from 'express';

import * as userController from '../controllers/users.controller';

const userRoute = express.Router();

userRoute.get('/', userController.getUsers);
userRoute.post('/signup', userController.signup);
userRoute.post('/signin', userController.signin);

export default userRoute;
