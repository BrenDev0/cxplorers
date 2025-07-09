import { Pool } from "pg";
import { GoogleUser, IGoogleRepository } from "./google.interface";

export class GoogleRepository implements IGoogleRepository {
    private pool: Pool;
    constructor(pool: Pool) {
        this.pool = pool;
 
    }

    async getGoogleUser(businessId: string): Promise<GoogleUser> {
         const sqlRead =  `
            SELECT token AS refresh_token
            FROM tokens
            WHERE business_id = $1
        `

        const result = await this.pool.query(sqlRead, [businessId])

        return result.rows[0];
    }
}