import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { Business, IBusinessesRepository } from "./businesses.interface";

export default class BusinessesRepository extends BaseRepository<Business> implements IBusinessesRepository {
    constructor(pool: Pool) {
        super(pool, "businesses")
    }

    async collectionByIds(businessIds: string[]): Promise<Business[]> {
        const sqlRead =  `
            SELECT * FROM ${this.table}
            WHERE business_id = ANY($1)
        `;

        const result = await this.pool.query(sqlRead, [businessIds]);

        return result.rows;
    }
} 