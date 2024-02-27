import { cleanEnv, port, str } from 'envalid';

export default cleanEnv(process.env, {
  MONGODB_CONNECTION_STRING: str(),
  BACKEND_PORT: port(),
  SECRET_ACCESS_KEY: str(),
  SECRET_SESSION_KEY: str(),
});
