import { cleanEnv, port, str } from 'envalid';

export default cleanEnv(process.env, {
  MONGODB_CONNECTION: str(),
  BACKEND_PORT: port(),
  SECRET_ACCESS_KEY: str(),
});
