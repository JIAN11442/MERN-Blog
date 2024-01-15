import express from 'express';

import * as userController from '../controllers/users.controller';

const userRoute = express.Router();

userRoute.get('/', userController.getUsers);
userRoute.post('/signup', userController.signup);

export default userRoute;
