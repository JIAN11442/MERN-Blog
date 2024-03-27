/* eslint-disable prefer-destructuring */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable import/prefer-default-export */

import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt, { type JsonWebTokenError } from 'jsonwebtoken';
import * as admin from 'firebase-admin';

import UserSchema from '../schemas/user.schema';

import { ValidateForSignIn, ValidateForSignUp } from '../utils/validateController.util';
import { genarateUsername, formatDatatoSend } from '../utils/generate.util';
import { SignUpBody, SignInBody } from '../utils/types.util';
import ErrorsHandle from '../utils/errors.util';

import type { GenarateDataType } from '../types';

export const jwtVerify: RequestHandler = async (req, res, next) => {
  let access_token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 從 headers 取得 token
      access_token = req.headers.authorization.split(' ')[1];

      // 驗證 token
      const verifyToken = jwt.verify(access_token, process.env.SECRET_ACCESS_KEY as string) as jwt.JwtPayload;

      if (!verifyToken) {
        throw createHttpError(403, 'Access token is invalid.');
      }

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
      console.log(ErrorsHandle(error as JsonWebTokenError));
      next(error);
    }
  }

  if (!access_token) {
    throw createHttpError(401, 'You are not authenticated and token is invalid.');
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

    // 控制回傳的資料架構，以防資料外洩
    res.status(201).json({ message: 'Registered successfully!', user: formatDatatoSend(newUserWithId) });
  } catch (error) {
    console.log(error);
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

    // 如果有此使用者，就要看是不是通過 google 註冊的
    if (isEmailValid) {
      // 如果不是通過 google 註冊的，就會按正常流程驗證密碼
      if (!isEmailValid.google_auth) {
        // 接著再去確認密碼是否正確(這裡是用 bcrypt 來比對密碼)
        const isPasswordValid = await bcrypt.compare(password, isEmailValid.personal_info?.password!);

        // 如果密碼不正確，就會拋出"無效的憑證"的錯誤
        if (!isPasswordValid) {
          throw createHttpError(401, 'Invalid  email or password');
        }

        // req.session.userId = isEmailValid.id;

        res.status(200).json({ message: 'Login successfully!', user: formatDatatoSend(isEmailValid.toObject()) });
      } else {
        // 如果是通過 google 註冊的，就會拋出"請以 google 登入"的錯誤
        throw createHttpError(
          403,
          'Account was created using google. Please logging in  with google to access the account.',
        );
      }
    }
  } catch (error) {
    next(error);
  }
};

export const googleAuth: RequestHandler = async (req, res, next) => {
  const { access_token } = req.body;

  try {
    // 驗證通過 Google 登入後給的 access_token 來驗證解碼使用者資料
    const decodedUser = await admin.auth().verifyIdToken(access_token);

    if (decodedUser) {
      // 從中取得使用者的 email, name, picture
      const { email, name } = decodedUser;

      // picture 是使用者的頭像，這裡將頭像的尺寸從 96x96 改成 384x384
      const picture = decodedUser.picture?.replace('s96-c', 's384-c');

      // 從數據庫中尋找是否有此 email 的使用者
      const user = await UserSchema.findOne({ 'personal_info.email': email }).select(
        'personal_info.fullname personal_info.username personal_info.profile_img google_auth',
      );

      // 如果有此使用者，就要看是不是通過 google 註冊的
      if (user) {
        // 如果不是通過 google 註冊的，就會拋出"請以密碼登入"的錯誤
        if (!user.google_auth) {
          throw createHttpError(
            403,
            'This email was signed up without google. Please log in with password to access the account.',
          );
        } else {
          // 如果是通過 google 註冊的，就會回傳使用者資料
          const userWithId = { ...user.toObject(), userId: user.id.toString() };

          res.status(200).json({ message: 'Login successfully!', user: formatDatatoSend(userWithId) });
        }
      } else {
        // 如果沒有此使用者，就會幫他註冊一個新的帳號
        const username = await genarateUsername(email!);

        const newUser = await UserSchema.create({
          personal_info: { fullname: name, email, profile_img: picture, username },
          google_auth: true,
        });

        const newUserWithId = { ...newUser.toObject(), userId: newUser.id.toString() };

        // 將新註冊的使用者資料回傳
        res.status(201).json({ message: 'Login successfully!', user: formatDatatoSend(newUserWithId) });
      }
    } else {
      throw createHttpError(500, 'Failed to authenticate you with google. Try with some other google account.');
    }
  } catch (error) {
    next(error);
  }
};
