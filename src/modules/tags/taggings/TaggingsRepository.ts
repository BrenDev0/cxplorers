import { Pool } from "pg";
import BaseRepository from "../../../core/repository/BaseRepository";
import { ITaggingsRepository, Tagging } from "./taggings.interface";

export default class TaggingsRepository extends BaseRepository<Tagging> implements ITaggingsRepository {
    constructor(pool: Pool) {
        super(pool, "tagged_items")
    }

    async resource(tagId: string, resourceId: string): Promise<Tagging | null> {
        const sqlRead = `
            SELECT * FROM ${this.table}
            WHERE tag_id = $1 AND resource_id = $2;
        `;

        const result = await this.pool.query(sqlRead, [tagId, resourceId]);

        return result.rows[0] || null
    }

    async collection(businessId: string, filterKey: string, filterValue: string): Promise<Tagging[]> {
        const sqlRead = `
            SELECT ${this.table}.*  
            from ${this.table}
            JOIN tags ON ${this.table}.tag_id = tags.tag_id
            JOIN businesses ON tags.business_id = businesses.business_id
            WHERE businesses.business_id = $1 AND  = ${this.table}.${filterKey} = $2;
        `;

        const result = await this.pool.query(sqlRead, [businessId, filterValue]);

        return result.rows;
    }

    async deleteByIds(tagId: string, resourceId: string): Promise<Tagging> {
        const sqlDelete = `
            DELETE FROM ${this.table}
            WHERE tag_id = $1 AND resource_id = $2
        `

        const result = await this.pool.query(sqlDelete, [tagId, resourceId]);

        return result.rows[0]
    }
}