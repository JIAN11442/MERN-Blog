/* eslint-disable import/prefer-default-export */

import { SignUpReqBody, SignInReqBody, BlogReqBody, ChangePasswordReqBody } from './types.util';
import env from './validateEnv.util';

const emailRegex = /^\w+((-\w+)|(\.\w+)|(\+\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*(\.[A-Za-z]+)+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
const characterLimit = env.BLOG_DES_CHAR_LIMIT;
const tagsLimit = env.BLOG_TAGS_LIMIT;

export const ValidateForSignUp = (RequestBody: SignUpReqBody) => {
  const { fullname, email, password } = RequestBody;

  if (!fullname || !email || !password) {
    return { statusCode: 400, message: 'Parameters missings' };
  }

  if (fullname.length < 3) {
    return { statusCode: 403, message: 'Fullname must be at least 3 letters long' };
  }
  if (!emailRegex.test(email)) {
    return { statusCode: 403, message: 'Email is invalid' };
  }
  if (!passwordRegex.test(password)) {
    return {
      statusCode: 403,
      message: 'Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters',
    };
  }

  return true;
};

export const ValidateForSignIn = (RequestBody: SignInReqBody) => {
  const { email, password } = RequestBody;
  if (!email || !password) {
    return { statusCode: 400, message: 'Parameters missings' };
  }

  if (!emailRegex.test(email)) {
    return { statusCode: 403, message: 'Email is invalid' };
  }
  if (!passwordRegex.test(password)) {
    return {
      statusCode: 403,
      message: 'Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters',
    };
  }

  return true;
};

export const ValidateForPublishBlog = (RequestBody: BlogReqBody) => {
  const { banner, title, content, des, tags, draft } = RequestBody;

  if (!title?.length) {
    return { statusCode: 403, message: 'You must provide title to publish the blog.' };
  }

  if (!draft) {
    if (!banner?.length) {
      return { statusCode: 403, message: 'You must provide blog banner to publish it.' };
    }

    if (!content?.blocks?.length) {
      return { statusCode: 403, message: 'There must be some blog content to publish it.' };
    }

    if (!des?.length || des?.length > characterLimit) {
      return { statusCode: 403, message: `You must provide blog description under ${characterLimit} characters.` };
    }

    if (!tags?.length || tags.length > tagsLimit) {
      return { statusCode: 403, message: `Provide tags in order to publish the blog, Maximum ${tagsLimit}.` };
    }
  }

  return true;
};

export const ValidateChangePassword = (RequestBody: ChangePasswordReqBody) => {
  const { currPassword, newPassword } = RequestBody;

  if (!currPassword || !newPassword) {
    return {
      statusCode: 400,
      message: 'Parameters missing',
    };
  }

  if (!passwordRegex.test(currPassword) || !passwordRegex.test(newPassword)) {
    return {
      statusCode: 403,
      message: 'Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters',
    };
  }

  if (currPassword === newPassword) {
    return {
      statusCode: 400,
      message: 'New password cannot be the same as the current password',
    };
  }

  return true;
};
