import { BusinessUser, BusinessUserData } from './businessUsers.interface'
import BaseRepository from "../../../core/repository/BaseRepository";
import { handleServiceError } from '../../../core/errors/error.service';
import Container from '../../../core/dependencies/Container';
import EncryptionService from '../../../core/services/EncryptionService';
import BusinessUsersRepository from './BusinessUsersRepository';

export default class BusinessUserService {
    private repository: BusinessUsersRepository;
    private block = "businessUsers.service"
    constructor(repository: BusinessUsersRepository) {
        this.repository = repository
    }

    async create(businessUser: BusinessUserData): Promise<BusinessUser> {
        const mappedBusinessUser = this.mapToDb(businessUser);
        try {
            return this.repository.create(mappedBusinessUser);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedBusinessUser)
            throw error;
        }
    }

    async resource(userId: string, businessId: string): Promise<BusinessUserData | null> {
        try {
            const result = await this.repository.resource(userId, businessId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result);
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {userId, businessId})
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

    mapToDb(businessUser: BusinessUserData): BusinessUser {
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
            businessId: businessUser.business_id,
            userId: businessUser.user_id,
            accountType: businessUser.account_type
        }
    }
}
