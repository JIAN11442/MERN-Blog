import mongoose from 'mongoose';

declare module 'express-serve-static-core' {
  interface Request {
    userId: mongoose.Types.ObjectId;
  }
}

// 或是

// declare global {
//   namespace Express {
//     interface Request {
//       user: UserSchemaType;
//     }
//   }
// }

// 參考資料：
// https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript
