import { Opportunity, OpportunityData } from './opportunities.interface'
import BaseRepository from "../../core/repository/BaseRepository";
import { handleServiceError } from '../../core/errors/error.service';
import Container from '../../core/dependencies/Container';
import EncryptionService from '../../core/services/EncryptionService';

export default class OpportunitiesService {
    private repository: BaseRepository<Opportunity>;
    private block = "opportunities.service"
    constructor(repository: BaseRepository<Opportunity>) {
        this.repository = repository
    }

    async create(opportunity: Omit<OpportunityData, "opportunityID">): Promise<Opportunity> {
        const mappedOpportunity = this.mapToDb(opportunity);
        try {
            return this.repository.create(mappedOpportunity as Opportunity);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedOpportunity)
            throw error;
        }
    }

    async resource(opportunityId: string): Promise<OpportunityData | null> {
        try {
            const result = await this.repository.selectOne("opportunity_id", opportunityId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {opportunityId})
            throw error;
        }
    }

    async collection(stageId: string): Promise<OpportunityData[]> {
        try {
            const result = await this.repository.select("stage_id", stageId);
            
            return result.map((opportunity) => this.mapFromDb(opportunity));
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {stageId})
            throw error;
        }
    }

    async update(opportunityId: string, changes: OpportunityData): Promise<Opportunity> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        try {
            return await this.repository.update("opportunity_id", opportunityId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", cleanedChanges)
            throw error;
        }
    }

    async delete(opportunityId: string): Promise<Opportunity> {
        try {
            return await this.repository.delete("opportunity_id", opportunityId) as Opportunity;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {opportunityId})
            throw error;
        }
    }

    mapToDb(opportunity: Omit<OpportunityData, "opportunityId">): Omit<Opportunity, "opportunity_id"> {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
           stage_id: opportunity.stageId,
           contact_id: opportunity.contactId,
           opportunity_value: opportunity.opportunityValue !== undefined && opportunity.opportunityValue !== null
            ? opportunity.opportunityValue.toFixed(2)
            : null,
           notes: opportunity.notes,
           opportunity_name: opportunity.opportunityName,
           opportunity_source: opportunity.opportunitySource,
           opportunity_status: opportunity.opportunityStatus,
           opportunity_business_name: opportunity.opportunityBusinessName,
           user_id: opportunity.userId
        }
    }

    mapFromDb(opportunity: Opportunity): OpportunityData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            opportunityId: opportunity.opportunity_id,
            stageId: opportunity.stage_id,
            contactId: opportunity.contact_id,
            opportunityValue: opportunity.opportunity_value !== null 
            ? Number(opportunity.opportunity_value) 
            : null,
            notes: opportunity.notes,
            opportunityName: opportunity.opportunity_name,
            opportunitySource: opportunity.opportunity_source,
            opportunityStatus: opportunity.opportunity_status,
            opportunityBusinessName: opportunity.opportunity_business_name,
            userId: opportunity.user_id
        }
    }
}
