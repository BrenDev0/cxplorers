import { Pool } from "pg";
import BaseRepository from "../../../core/repository/BaseRepository";
import { ITaggingsRepository, Tagging } from "./taggings.interface";

export default class TaggingsRepository extends BaseRepository<Tagging> implements ITaggingsRepository {
    constructor(pool: Pool) {
        super(pool, "taggings")
    }

    async resource(tagId: string, contactId: string): Promise<Tagging | null> {
        const sqlRead = `
            SELECT * FROM ${this.table}
            WHERE tag_id = $1 AND contact_id = $2;
        `;

        const result = await this.pool.query(sqlRead, [tagId, contactId]);

        return result.rows[0] || null
    }

    async deleteByIds(tagId: string, contactId: string): Promise<Tagging> {
        const sqlDelete = `
            DELETE FROM ${this.table}
            WHERE tag_id = $1 AND contact_id = $2
        `

        const result = await this.pool.query(sqlDelete, [tagId, contactId]);

        return result.rows[0]
    }
}