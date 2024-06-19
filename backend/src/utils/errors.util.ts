import { JsonWebTokenError } from 'jsonwebtoken';

const ErrorsHandle = (error: Error | JsonWebTokenError) => {
  let errMsg = 'An unknown error occurred';

  if (error instanceof Error && 'code' in error) {
    // 11000 錯誤通常是 MongoDB 的一種特定錯誤
    // 表示唯一索引約束被違反，即重複
    if (error.code === 11000) {
      if (error.message.includes('email')) {
        errMsg = 'Email is already exists';
      } else if (error.message.includes('username')) {
        errMsg = 'Username is  already exists';
      }
    }
    // 如果出現的是 ERR_INVALID_URL，那就是提供的 URL 格式不正確
    // 比如網域前面沒有 http(s)://
    else if (error.code === 'ERR_INVALID_URL') {
      errMsg = 'You must provide full social links with http(s) included';
    }
  } else if (error instanceof JsonWebTokenError) {
    // 如果錯誤訊息是 'jwt malformed'，
    // 那就是還沒有提供 token，或者 token 是 null
    if (error.message === 'jwt malformed') {
      errMsg = 'Token is null';
    }
  }

  return errMsg;
};

export default ErrorsHandle;
