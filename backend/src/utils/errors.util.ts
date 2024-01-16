const ErrorsHandle = (error: Error) => {
  let errMsg = 'An unknown error occurred';

  // 11000 錯誤通常是 MongoDB 的一種特定錯誤，表示唯一索引約束被違反。
  if ('code' in error && error.code === 11000) {
    errMsg = 'Email already exists';
  }

  return errMsg;
};

export default ErrorsHandle;
