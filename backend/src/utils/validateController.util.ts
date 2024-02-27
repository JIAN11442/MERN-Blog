/* eslint-disable import/prefer-default-export */

import { SignUpBody, SignInBody } from './types.util';

const emailRegex = /^\w+((-\w+)|(\.\w+)|(\+\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*(\.[A-Za-z]+)+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

export const ValidateForSignUp = (RequestBody: SignUpBody) => {
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

export const ValidateForSignIn = (RequestBody: SignInBody) => {
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
