/* eslint-disable prefer-destructuring */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable import/prefer-default-export */

import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import UserSchema from '../schemas/user.schema';
import { ValidateForSignIn, ValidateForSignUp } from '../utils/validateController.util';
import { genarateUsername, formatDatatoSend } from '../utils/generate.util';
import { SignUpBody, SignInBody } from '../utils/types.util';
import type { GenarateDataType } from '../types';

export const protectedRoute: RequestHandler = async (req, res, next) => {
  let access_token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 從 headers 取得 token
      access_token = req.headers.authorization.split(' ')[1];

      // 驗證 token
      const verifyToken = jwt.verify(access_token, process.env.SECRET_ACCESS_KEY as string) as jwt.JwtPayload;

      // 根據解碼後的 decoded.id 從數據庫找尋使用者資料
      const user = await UserSchema.findById(verifyToken.userId).exec();

      // 如果使用者資料不存在，就會拋出"使用者未找到"的錯誤
      if (!user) {
        throw createHttpError(404, 'User not found with this token');
      }

      // 將使用者資料存入 req.user
      req.user = formatDatatoSend(user.toObject()) as GenarateDataType;

      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  if (!access_token) {
    next(createHttpError(401, 'You are not authenticated and token is invalid.'));
  }
};

export const sessionAuthentication: RequestHandler = async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await UserSchema.findById(req.session.userId).exec();

      if (!user) {
        throw createHttpError(404, 'User not found with this token');
      }

      res.json({ message: 'You are authenticated!', user: formatDatatoSend(user.toObject()) });
    } catch (error) {
      next(error);
    }
  } else {
    res.json({ message: 'You are not authenticated!' });
  }
};
export const jwtAuthentication: RequestHandler = async (req, res, next) => {
  try {
    res.json({ message: 'You are authenticated!', user: req.user });
  } catch (error) {
    next(error);
  }
};

export const signup: RequestHandler<unknown, unknown, SignUpBody, unknown> = async (req, res, next) => {
  const validateResult = ValidateForSignUp(req.body);
  const { fullname, email, password } = req.body;

  try {
    // 如果 validateResult 不是 true，就會拋出錯誤訊息
    if (validateResult !== true) {
      throw createHttpError(validateResult.statusCode, validateResult.message);
    }

    const genaratedUsername = await genarateUsername(email);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserSchema.create({
      personal_info: {
        fullname,
        email,
        password: hashedPassword,
        username: genaratedUsername,
      },
    });

    // req.session.userId = newUser.id;

    const newUserWithId = { ...newUser.toObject(), userId: newUser.id.toString() };

    // // 控制回傳的資料架構，以防資料外洩
    res.status(201).json({ message: 'Registered successfully!', user: formatDatatoSend(newUserWithId) });
  } catch (error) {
    next(error);
  }
};

export const signin: RequestHandler<unknown, unknown, SignInBody, unknown> = async (req, res, next) => {
  const validateResult = ValidateForSignIn(req.body);
  const { email, password } = req.body;

  try {
    if (validateResult !== true) {
      throw createHttpError(validateResult.statusCode, validateResult.message);
    }

    const isEmailValid = await UserSchema.findOne({ 'personal_info.email': email }).exec();

    // 如果沒有此使用者，就會拋出"無效的憑證"的錯誤
    if (!isEmailValid) {
      throw createHttpError(401, 'Invalid email or password');
    }

    // 接著再去確認密碼是否正確(這裡是用 bcrypt 來比對密碼)
    const isPasswordValid = await bcrypt.compare(password, isEmailValid.personal_info?.password!);

    // 如果密碼不正確，就會拋出"無效的憑證"的錯誤
    if (!isPasswordValid) {
      throw createHttpError(401, 'Invalid  email or password');
    }

    // req.session.userId = isEmailValid.id;

    res.status(200).json({ message: 'Login successfully!', user: formatDatatoSend(isEmailValid.toObject()) });
  } catch (error) {
    next(error);
  }
};
