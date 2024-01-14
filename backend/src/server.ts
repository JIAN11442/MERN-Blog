import 'dotenv/config';
import mongoose from 'mongoose';

import app from './app';
import groupConsole from './utils/console.util';
import env from './utils/validateEnv.util';

const port = env.PORT;
const mongodbConnection = env.MONGODB_CONNECTION;

// Mongoose connection
mongoose.connect(mongodbConnection, { autoIndex: true }).then(() => {
  groupConsole('Connected to MongoDB');

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
