/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import express, { Request, Response, NextFunction } from 'express';
import createHttpError, { isHttpError } from 'http-errors';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import admin from 'firebase-admin';

import authRoute from './routers/auth.route';
import awsRoute from './routers/aws.route';
import blogRoute from './routers/blog.route';
import userRoute from './routers/user.route';

import ErrorsHandle from './utils/errors.util';
import env from './utils/validateEnv.util';

import serviceAccount from './firebase/mern-blogging-ts-firebase-adminsdk-l5srr-14255d77e6.json';

// Initialize Firebase Admin SDK
admin.initializeApp({ credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) });

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

// Session Configuration
app.use(
  session({
    secret: env.SECRET_SESSION_KEY,
    name: 'jian.uid',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 10, // 1 minute
    },
    store: new MongoStore({ mongoUrl: env.MONGODB_CONNECTION_STRING }),
  }),
);

app.use('/api/aws', awsRoute);
app.use('/api/auth', authRoute);
app.use('/api/blog', blogRoute);
app.use('/api/user', userRoute);

// Error handling
app.use((req, res, next) => {
  next(createHttpError(404, 'This route does not exist'));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  let errMsg = 'An unknown error occurred';
  let statusCode = 500;
  // isHttpError(error) 是一種特定於 HTTP 錯誤的檢查。
  // HTTP 錯誤通常是由於 HTTP 請求失敗或服務器返回了錯誤狀態碼。
  // 這種錯誤通常包含一個 statusCode 屬性和一個 message 屬性。

  // 然而，11000 錯誤通常是 MongoDB 的一種特定錯誤，表示唯一索引約束被違反。
  // 這種錯誤不是 HTTP 錯誤，而是來自於你的數據庫操作。
  // 因此如果只使用 isHttpError(error) 並不能偵測到 11000 錯誤。
  if (isHttpError(error)) {
    statusCode = error.statusCode;
    errMsg = error.message;
  } else if (error instanceof Error) {
    errMsg = ErrorsHandle(error);
  }

  res.status(statusCode).json({ errorMessage: errMsg });
});

export default app;
