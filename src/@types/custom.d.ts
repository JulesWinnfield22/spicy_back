// @types/express/index.d.ts or src/types/express.d.ts
import { Request } from 'express';
import { User } from '../interface';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}