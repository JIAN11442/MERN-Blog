import 'dotenv/config';
import mongoose from 'mongoose';

import app from './app';
import env from './utils/validateEnv.util';
import consoleLogBox from './utils/console.util';

const port = env.BACKEND_PORT;
const mongodbConnection = env.MONGODB_CONNECTION_STRING;

// Mongoose connection
mongoose.connect(mongodbConnection, { autoIndex: true }).then(() => {
  consoleLogBox('Connected to MongoDB');

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/api`);
  });
});
