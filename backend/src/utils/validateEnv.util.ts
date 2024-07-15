import { cleanEnv, port, str, num } from 'envalid';

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
  BLOG_DES_CHAR_LIMIT: num(),
  BLOG_TAGS_LIMIT: num(),
  GET_LATEST_BLOGS_LIMIT: num(),
  GET_TRENDING_BLOGS_LIMIT: num(),
  GET_TRENDING_TAGS_LIMIT: num(),
  GET_RELATED_USERS_LIMIT: num(),
  GET_COMMENTS_LIMIT: num(),
  BIO_CHAR_LIMIT: num(),
  NOTIFICATION_LOAD_LIMIT: num(),
  GET_USER_BLOGS_LIMIT: num(),
  LOAD_AUTHOR_LIMIT: num(),
});
