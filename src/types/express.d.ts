import { User } from '../../modules/user'

import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }
}