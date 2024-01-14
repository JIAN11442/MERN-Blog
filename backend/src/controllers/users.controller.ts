/* eslint-disable import/prefer-default-export */

import { RequestHandler } from 'express';
import createHttpError from 'http-errors';

interface SignupBody {
  fullname: string;
  email: string;
  password: string;
}

export const signup: RequestHandler<unknown, unknown, SignupBody, unknown> = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;

    // validate fullname, email, password
    if (fullname.length < 3) {
      throw createHttpError(403, 'Fullname must be at least 3 letters long');
    }

    res.status(200).json(req.body);
  } catch (error) {
    next(error);
  }
};
