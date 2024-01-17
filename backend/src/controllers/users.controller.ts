/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
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
    res.status(201).json(formatDatatoSend(newUserWithId));
  } catch (error) {
    next(error);
  }
};

interface LoginBody {
  email: string;
  password: string;
}

export const login: RequestHandler<unknown, unknown, LoginBody, unknown> = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // 如果 req.body 沒有 email 或 password，就會拋出"參數不足"的錯誤
    if (!email || !password) {
      throw createHttpError(400, 'Parameters missing');
    }

    // 如果 email 不符合 email 的正規表達式，就會拋出"郵件格式無效"的錯誤
    if (!emailRegex.test(email)) {
      throw createHttpError(403, 'Email is invalid');
    }

    // 如果 password 不符合 password 的正規表達式，就會拋出"密碼格式無效"的錯誤
    if (!passwordRegex.test(password)) {
      throw createHttpError(
        403,
        'Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters',
      );
    }

    // 確認有抓到資料且格式都正確後，再去資料庫確認是否有此使用者
    const isEmailValid = await UserSchema.findOne({ 'personal_info.email': email }).exec();

    // 如果沒有此使用者，就會拋出"無效的憑證"的錯誤
    if (!isEmailValid) {
      throw createHttpError(401, 'Invalid credentials');
    }

    // 接著再去確認密碼是否正確(這裡是用 bcrypt 來比對密碼)
    const isPasswordValid = await bcrypt.compare(password, isEmailValid.personal_info?.password!);

    // 如果密碼不正確，就會拋出"無效的憑證"的錯誤
    if (!isPasswordValid) {
      throw createHttpError(401, 'Invalid credentials');
    }

    // 如果郵件與密碼都正確，就回傳使用者資料
    res.status(200).json(formatDatatoSend(isEmailValid.toObject()));
  } catch (error) {
    console.log(error);
    next(error);
  }
};
