import mongoose from 'mongoose';

// 擴展 express-session 的 SessionData 模塊，讓我們可以在 session 中儲存 userId
declare module 'express-session' {
  interface SessionData {
    userId: mongoose.Types.ObjectId;
  }
}
