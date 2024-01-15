/* eslint-disable import/prefer-default-export */

import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import UserSchema from '../schemas/user.schema';

const emailRegex = /^\w+((-\w+)|(\.\w+)|(\+\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*(\.[A-Za-z]{3})+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

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
    const username = await email.split('@')[0];

    // const newUser = await new UserSchema({...}) 這樣寫也可以
    const newUser = await UserSchema.create({
      personal_info: {
        fullname,
        email,
        password: hashedPassword,
        username,
      },
    });

    res.status(200).json(newUser);
  } catch (error) {
    next(error);
  }
};
