/* eslint-disable import/prefer-default-export */

import type { RequestHandler } from 'express';

export const createBlog: RequestHandler = async (req, res, next) => {
  res.status(200).json(req.body);
};
