import { Pool } from "pg"
import BaseRepository from "../../../core/repository/BaseRepository"
import { BusinessUser, IBusinessUsersRepository } from "./businessUsers.interface"
import { UserData } from "../../users/users.interface";
import { sql_v1beta4 } from "googleapis";

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

    async ownersCollection(userId: string): Promise<BusinessUser[]> {
        const sqlRead = `
            SELECT * FROM ${this.table}
            WHERE user_id = $1 AND role = 'owner'
        `;

        const result = await this.pool.query(sqlRead, [userId]);
        return result.rows
    }

    async getBusinessUsers(businessId: string): Promise<BusinessUser[]> {
        const sqlRead = `
            SELECT business_users.*, users.name, users.email, users.phone
            FROM business_users 
            JOIN users ON business_users.user_id = users.user_id
            WHERE business_users.business_id = $1;
        `
        const result = await this.pool.query(sqlRead, [businessId]);

        return result.rows;
    }

    async getAllUsers(userId: string): Promise<BusinessUser[]> {
        const sqlRead = `
            SELECT 
            business_users.role,
            users.name,
            users.email,
            users.phone,
            users.user_id,
            business_users.business_user_id,
            businesses.business_id,
            businesses.business_name AS businessName
            FROM business_users
            JOIN users ON users.user_id = business_users.user_id
            JOIN businesses ON businesses.business_id = business_users.business_id
            WHERE business_users.business_id IN (
                SELECT business_users.business_id
                FROM business_users
                WHERE business_users.user_id = $1 AND business_users.role = 'owner'
            )
            AND business_users.user_id != $1;    
            ;

    `

    const result = await this.pool.query(sqlRead, [userId]);
    return result.rows
    }

    async updateByIds(userId: string, businessId: string, changes: Record<string, string>): Promise<BusinessUser> {
        const clauses = Object.keys(changes).map((key, i) => `${key} = $${i + 1}` );
        let values = Object.values(changes);

        const sqlUpdate = `
            UPDATE ${this.table}
            SET ${clauses}
            WHERE user_id = $${Object.keys(changes).length + 1} AND business_id = $${Object.keys(changes).length + 2}
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