import { IRepository } from "../../../core/repository/repository.interface";

export interface BusinessUser {
  business_user_id: string
  business_id: string;
  user_id: string;
  account_type: string;
}

export interface BusinessUserData {
  businessUserId: string
  businessId: string;
  userId: string;
  accountType: string;
}

export interface IBusinessUsersRepository extends IRepository<BusinessUser> {
  updateByIds(userId: string, businessId: string,  changes: Record<string, string>): Promise<BusinessUser>;
  deleteByIds(userId: string, businessId: string): Promise<BusinessUser>;
  resource(userId: string, businessId: string): Promise<BusinessUser | null>;
  ownersCollection(userId: string): Promise<BusinessUser[]>;
}