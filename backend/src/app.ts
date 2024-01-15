/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import express, { Request, Response, NextFunction } from 'express';
import createHttpError, { isHttpError } from 'http-errors';
import morgan from 'morgan';

import userRoute from './routers/users.route';

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use('/api/users', userRoute);

// Error handling
app.use((req, res, next) => {
  next(createHttpError(404, 'This route does not exist'));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  let errMsg = 'An unknown error occurred';
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.statusCode;
    errMsg = error.message;
  }

  res.status(statusCode).json({ error: errMsg });
});

export default app;
