import { User } from '../../modules/user'

import * as express from 'express';
import { PermissionData } from '../modules/permissions/permissions.interface';

declare global {
  namespace Express {
    interface Request {
      user: User,
      permissions: PermissionData[]
      role: string;
    }
  }
}