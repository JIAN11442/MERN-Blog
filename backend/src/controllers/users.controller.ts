/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */

import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import env from '../utils/validateEnv.util';
import UserSchema, { UserSchemaType } from '../schemas/user.schema';

const emailRegex = /^\w+((-\w+)|(\.\w+)|(\+\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*(\.[A-Za-z]+)+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const genarateUsername = async (email: string) => {
  const username = email.split('@')[0];
  const isUsernameExist = await UserSchema.exists({ 'personal_info.username': username }).then((result) => result);

  const newUsername = isUsernameExist ? `${username}-${uuidv4()}` : username;

  return newUsername;
};
const formatDatatoSend = (user: UserSchemaType & { _id: string }) => {
  // access_token 用來驗證使用者身份
  const access_token = jwt.sign({ id: user._id }, env.SECRET_ACCESS_KEY);

  return {
    access_token,
    profile_img: user.personal_info?.profile_img,
    username: user.personal_info?.username,
    fullname: user.personal_info?.fullname,
  };
};

interface SignupBody {
  fullname: string;
  email: string;
  password: string;
}

export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await UserSchema.find().exec();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const signup: RequestHandler<unknown, unknown, SignupBody, unknown> = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;

    // validate fullname, email, password
    if (!fullname || !email || !password) {
      throw createHttpError(400, 'Parameters missing');
    }

    if (fullname.length < 3) {
      throw createHttpError(403, 'Fullname must be at least 3 letters long');
    }

    if (!emailRegex.test(email)) {
      throw createHttpError(403, 'Email is invalid');
    }

    if (!passwordRegex.test(password)) {
      throw createHttpError(
        403,
        'Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await genarateUsername(email);

    // const newUser = await new UserSchema({...}) 這樣寫也可以
    const newUser = await UserSchema.create({
      personal_info: {
        fullname,
        email,
        password: hashedPassword,
        username,
      },
    });

    const newUserWithId = { ...newUser.toObject(), _id: newUser._id.toString() };

    // 控制回傳的資料架構，以防資料外洩
    res.status(200).json(formatDatatoSend(newUserWithId));
  } catch (error) {
    next(error);
  }
};
