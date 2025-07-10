import { Tagging, TaggingData } from './taggings.interface'
import BaseRepository from "../../../core/repository/BaseRepository";
import { handleServiceError } from '../../../core/errors/error.service';
import Container from '../../../core/dependencies/Container';
import EncryptionService from '../../../core/services/EncryptionService';
import TaggingsRepository from './TaggingsRepository';

export default class TaggingsService {
    private repository: TaggingsRepository;
    private block = "taggings.service"
    constructor(repository: TaggingsRepository) {
        this.repository = repository
    }

    async create(taggings: TaggingData): Promise<Tagging> {
        const mappedTagging = this.mapToDb(taggings);
        try {
            return this.repository.create(mappedTagging);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedTagging)
            throw error;
        }
    }

    async resource(tagId: string, contactId: string): Promise<TaggingData | null> {
        try {
            const result = await this.repository.resource(tagId, contactId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {tagId, contactId})
            throw error;
        }
    }

    async collection(whereCol: string, identifier: string): Promise<TaggingData[]>{
        try {
            const result = await this.repository.select(whereCol, identifier);

            return result.map((tagging) => this.mapFromDb(tagging));
        } catch (error) {
            handleServiceError(error as Error, this.block, "collection", {whereCol, identifier})
            throw error;
        }
    }

    // async update(taggingId: string, changes: TaggingData): Promise<Tagging> {
    //     const mappedChanges = this.mapToDb(changes);
    //     const cleanedChanges = Object.fromEntries(
    //         Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
    //     );
    //     try {
    //         return await this.repository.update("tagging_id", taggingId, cleanedChanges);
    //     } catch (error) {
    //         handleServiceError(error as Error, this.block, "update", cleanedChanges)
    //         throw error;
    //     }
    // }

    async delete( tagId: string, contactId: string): Promise<Tagging> {
        try {
            return await this.repository.deleteByIds(tagId, contactId)
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {tagId, contactId})
            throw error;
        }
    }

    mapToDb(tagging: TaggingData): Tagging {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
           tag_id: tagging.tagId,
           contact_id: tagging.contactId
        }
    }

    mapFromDb(tagging: Tagging): TaggingData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            tagId: tagging.tag_id,
            contactId: tagging.contact_id
        }
    }
}
