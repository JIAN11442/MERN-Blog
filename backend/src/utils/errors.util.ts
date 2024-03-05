import { JsonWebTokenError } from 'jsonwebtoken';

const ErrorsHandle = (error: Error | JsonWebTokenError) => {
  let errMsg = 'An unknown error occurred';

  // 11000 錯誤通常是 MongoDB 的一種特定錯誤，表示唯一索引約束被違反。
  if (error instanceof Error && 'code' in error && error.code === 11000) {
    errMsg = 'Email already exists';
  } else if (error instanceof JsonWebTokenError) {
    if (error.message === 'jwt malformed') {
      errMsg = 'Token is null';
    }
  }

  return errMsg;
};

export default ErrorsHandle;
