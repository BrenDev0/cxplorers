import { BusinessUser, BusinessUserData } from './businessUsers.interface'
import BaseRepository from "../../../core/repository/BaseRepository";
import { handleServiceError } from '../../../core/errors/error.service';
import Container from '../../../core/dependencies/Container';
import EncryptionService from '../../../core/services/EncryptionService';
import BusinessUsersRepository from './BusinessUsersRepository';

export default class BusinessUsersService {
    private repository: BusinessUsersRepository;
    private block = "businessUsers.service"
    constructor(repository: BusinessUsersRepository) {
        this.repository = repository
    }

    async create(businessUser: Omit<BusinessUserData, "businessUserId">): Promise<BusinessUser> {
        const mappedBusinessUser = this.mapToDb(businessUser);
        try {
            return this.repository.create(mappedBusinessUser as BusinessUser);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedBusinessUser)
            throw error;
        }
    }

    async resource(businessUserId: string): Promise<BusinessUserData | null> {
        try {
            const result = await this.repository.selectOne("business_user_id", businessUserId);
            if(!result) {
                return null
            }

            return this.mapFromDb(result);
        } catch (error) {
            handleServiceError(error as Error, this.block, "select by ids", {businessUserId})
            throw error;
        }
    }

    async selectByIds(userId: string, businessId: string): Promise<BusinessUserData | null> {
        try {
            const result = await this.repository.resource(userId, businessId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result);
        } catch (error) {
            handleServiceError(error as Error, this.block, "select by ids", {userId, businessId})
            throw error;
        }
    }

    async collection(col: string, identifier: string): Promise<BusinessUserData[]> {
        try {
            const result = await this.repository.select(col, identifier);
            
            return result.map((businessUser) => this.mapFromDb(businessUser));
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {col, identifier})
            throw error;
        }
    }
    

    async ownersCollection(userId: string): Promise<BusinessUserData[]>{
        try {
            const result = await this.repository.ownersCollection(userId);

            return result.map((businessUser) => this.mapFromDb(businessUser));
        } catch (error) {
            handleServiceError(error as Error, this.block, "collection", {})
            throw error;
        }
    }

    async update(userId: string, businessUserId: string, changes: BusinessUserData): Promise<BusinessUser> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        try {
            return await this.repository.updateByIds(userId, businessUserId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", cleanedChanges)
            throw error;
        }
    }

    async delete(userId: string, businessId: string): Promise<BusinessUser> {
        try {
            return await this.repository.deleteByIds(userId, businessId) as BusinessUser;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", { userId, businessId })
            throw error;
        }
    }

    mapToDb(businessUser: Omit<BusinessUserData, "businessUserId">): Omit<BusinessUser, "business_user_id"> {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
           business_id: businessUser.businessId,
           user_id: businessUser.userId,
           account_type: businessUser.accountType
        }
    }

    mapFromDb(businessUser: BusinessUser): BusinessUserData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            businessUserId: businessUser.business_user_id,
            businessId: businessUser.business_id,
            userId: businessUser.user_id,
            accountType: businessUser.account_type
        }
    }
}
