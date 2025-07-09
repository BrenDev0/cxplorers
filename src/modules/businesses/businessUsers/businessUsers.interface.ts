import { IRepository } from "../../../core/repository/repository.interface";

export interface BusinessUser {
  business_user_id: string
  business_id: string;
  user_id: string;
  role: string;
  name?: string
  email?: string
  phone?: string
  business_name?: string;
}

export interface BusinessUserData {
  businessUserId: string
  businessId: string;
  userId: string;
  role: string;
  name?: string
  email?: string
  phone?: string
  businessName?: string;
}

export interface IBusinessUsersRepository extends IRepository<BusinessUser> {
  updateByIds(userId: string, businessId: string,  changes: Record<string, string>): Promise<BusinessUser>;
  deleteByIds(userId: string, businessId: string): Promise<BusinessUser>;
  resource(userId: string, businessId: string): Promise<BusinessUser | null>;
  ownersCollection(userId: string): Promise<BusinessUser[]>;
  getAllUsers(userId: string): Promise<BusinessUser[]>;
  getBusinessUsers(businessId: string): Promise<BusinessUser[]>
}