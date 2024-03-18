/* eslint-disable import/prefer-default-export */

import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';

import { generateUploadUrl } from '../utils/generate.util';

export const getUploadUrl: RequestHandler = async (req, res, next) => {
  try {
    generateUploadUrl()
      .then((url) => res.status(200).json({ uploadURL: url }))
      .catch((error) => {
        console.log(error.message);
        throw createHttpError(500, error.message);
      });
  } catch (error) {
    next(error);
  }
};
