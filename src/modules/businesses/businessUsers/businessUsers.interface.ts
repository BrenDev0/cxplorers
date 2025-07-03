import { IRepository } from "../../../core/repository/repository.interface";

export interface BusinessUser {
  business_id: string;
  user_id: string;
  account_type: string;
}

export interface BusinessUserData {
  businessId: string;
  userId: string;
  accountType: string;
}

export interface IBusinessUsersRepository extends IRepository<BusinessUser> {
  updateByIds(userId: string, businessId: string,  changes: Record<string, string>): Promise<BusinessUser>;
  deleteByIds(userId: string, businessId: string): Promise<BusinessUser>;
  resource(userId: string, businessId: string): Promise<BusinessUser | null>;
}