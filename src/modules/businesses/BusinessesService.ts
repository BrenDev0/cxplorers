import { Business, BusinessData } from './businesses.interface'
import BaseRepository from "../../core/repository/BaseRepository";
import { handleServiceError } from '../../core/errors/error.service';
import Container from '../../core/dependencies/Container';
import EncryptionService from '../../core/services/EncryptionService';

export default class BusinessesService {
    private repository: BaseRepository<Business>;
    private block = "businesses.service"
    constructor(repository: BaseRepository<Business>) {
        this.repository = repository
    }

    async create(business: Omit<BusinessData, "businessId">): Promise<Business> {
        const mappedBusiness = this.mapToDb(business);
        try {
            return this.repository.create(mappedBusiness as Business);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedBusiness)
            throw error;
        }
    }

    async resource(businessId: string): Promise<BusinessData | null> {
        try {
            const result = await this.repository.selectOne("bsuiness_id", businessId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {businessId})
            throw error;
        }
    }

    async update(businessId: string, changes: BusinessData): Promise<Business> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        try {
            return await this.repository.update("business_id", businessId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", cleanedChanges)
            throw error;
        }
    }

    async delete(businessId: string): Promise<Business> {
        try {
            return await this.repository.delete("business_id", businessId) as Business;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {businessId})
            throw error;
        }
    }

    mapToDb(business: Omit<BusinessData, "businessId">): Omit<Business, "business_id"> {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            business_logo: business.businessLogo,
            business_name: business.businessName,
            legal_name: business.legalName,
            business_email: business.businessEmail,
            business_phone: business.businessPhone,
            branded_domain: business.brandedDomain,
            business_website: business.businessWebsite,
            business_niche: business.businessNiche,
            platform_language: business.platformLanguage,
            communication_language: business.communicationLanguage
        }
    }

    mapFromDb(business: Business): BusinessData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            businessId: business.business_id,
            businessName: business.business_name,
            legalName: business.legal_name,
            businessEmail: business.business_email,
            businessPhone: business.business_phone,
            brandedDomain: business.branded_domain,
            businessWebsite: business.business_website,
            businessNiche: business.business_niche,
            businessLogo: business.business_logo,
            platformLanguage: business.platform_language,
            communicationLanguage: business.communication_language
        }
    }
}
