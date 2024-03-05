import type { GenarateDataType } from '../src/types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: GenarateDataType;
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
