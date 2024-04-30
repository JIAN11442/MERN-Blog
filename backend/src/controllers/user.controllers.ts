/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';

import UserSchema from '../schemas/user.schema';

import env from '../utils/validateEnv.util';

const getRelatedUserLimit = env.GET_RELATED_USERS_LIMIT;

// 取得 username 包含 query 的使用者
export const getRelatedUsersByQuery: RequestHandler = async (req, res, next) => {
  try {
    const { query, page } = req.body;

    if (!query) {
      throw createHttpError(400, 'Please provide a query from client.');
    }

    if (!page) {
      throw createHttpError(400, 'Please provide a page number from client.');
    }

    const users = await UserSchema.find({ 'personal_info.username': new RegExp(query, 'i') })
      .skip((page - 1) * getRelatedUserLimit)
      .limit(getRelatedUserLimit)
      .select('personal_info.fullname personal_info.username personal_info.profile_img -_id');

    if (!users) throw createHttpError(500, 'No users found with this query.');

    res.status(200).json({ queryUsers: users });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 取得所有 username 包含 query 的使用者數量
export const getRelatedUsersByQueryCount: RequestHandler = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      throw createHttpError(400, 'Please provide a query from client.');
    }

    const queryUsersCount = await UserSchema.countDocuments({ 'personal_info.username': new RegExp(query, 'i') });

    res.status(200).json({ totalDocs: queryUsersCount });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
