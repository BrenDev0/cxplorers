import { Pool } from "pg"
import BaseRepository from "../../../core/repository/BaseRepository"
import { BusinessUser, IBusinessUsersRepository } from "./businessUsers.interface"

export default class BusinessUsersRepository extends BaseRepository<BusinessUser> implements IBusinessUsersRepository {
    constructor(pool: Pool) {
        super(pool, "business_users")
    }

    async resource(userId: string, businessId: string): Promise<BusinessUser | null> {
        const sqlRead = `
            SELECT * from ${this.table}
            WHERE user_id = $1 AND business_id = $2
        `;

        const result = await this.pool.query(sqlRead, [userId, businessId]);

        return result.rows[0] ||  null;
    }

    async updateByIds(userId: string, businessId: string, changes: Record<string, string>): Promise<BusinessUser> {
        const clauses = Object.keys(changes).map((key, i) => `${key} = $${i + 1}` );
        let values = Object.values(changes);

        const sqlUpdate = `
            UPDATE ${this.table}
            SET ${clauses}
            WHERE user_id = $${Object.keys(changes).length + 1} AND bsuiness_id = $${Object.keys(changes).length + 2}
            RETURNING *;
        `;
        
        values.push(userId, businessId);

        const result = await this.pool.query(
            sqlUpdate,
            values
        );

        return result.rows[0];
    }

    async deleteByIds(userId: string, businessId: string): Promise<BusinessUser> {
        const sqlDelete = `
            DELETE FROM ${this.table} 
            WHERE user_id = $1 AND business_id = $2
            RETURNING *;
        `;

        const result = await this.pool.query(
            sqlDelete,
            [userId, businessId]
        );

        return result.rows[0];
    }
}