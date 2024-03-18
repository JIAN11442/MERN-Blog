import { cleanEnv, port, str } from 'envalid';

export default cleanEnv(process.env, {
  MONGODB_CONNECTION_STRING: str(),
  BACKEND_PORT: port(),
  SECRET_ACCESS_KEY: str(),
  SECRET_SESSION_KEY: str(),
  AWS_REGION: str(),
  AWS_BUCKET_NAME: str(),
  AWS_ACCESS_KEY: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE: str(),
});
