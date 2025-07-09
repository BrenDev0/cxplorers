import { Tag, TagData } from './tags.interface'
import BaseRepository from "../../core/repository/BaseRepository";
import { handleServiceError } from '../../core/errors/error.service';
import Container from '../../core/dependencies/Container';
import EncryptionService from '../../core/services/EncryptionService';

export default class TagsService {
    private repository: BaseRepository<Tag>;
    private block = "tags.service"
    constructor(repository: BaseRepository<Tag>) {
        this.repository = repository
    }

    async create(tags: Omit<TagData, "tagId">): Promise<Tag> {
        const mappedTag = this.mapToDb(tags);
        try {
            return this.repository.create(mappedTag as Tag);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedTag)
            throw error;
        }
    }

    async resource(tagId: string): Promise<TagData | null> {
        try {
            const result = await this.repository.selectOne("tag_id", tagId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {tagId})
            throw error;
        }
    }

    async collection(businessId: string): Promise<TagData[]> {
        try {
            const result = await this.repository.select("business_id", businessId);
           
            return result.map((tag) => this.mapFromDb(tag));
        } catch (error) {
            handleServiceError(error as Error, this.block, "collection", {businessId})
            throw error;
        }
    }

    async update(tagId: string, changes: TagData): Promise<Tag> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        try {
            return await this.repository.update("tag_id", tagId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", cleanedChanges)
            throw error;
        }
    }

    async delete(tagId: string): Promise<Tag> {
        try {
            return await this.repository.delete("tag_id", tagId) as Tag;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {tagId})
            throw error;
        }
    }

    mapToDb(tag: Omit<TagData, "tagId">): Omit<Tag, "tag_id"> {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
           business_id: tag.businessId,
           tag: tag.tag
        }
    }

    mapFromDb(tag: Tag): TagData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            tagId: tag.tag_id,
            businessId: tag.business_id,
            tag: tag.tag
        }
    }
}
