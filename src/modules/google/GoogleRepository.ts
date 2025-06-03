import { Pool } from "pg";
import { GoogleUser, IGoogleRepository } from "./google.interface";

export class GoogleRepository implements IGoogleRepository {
    private pool: Pool;
    constructor(pool: Pool) {
        this.pool = pool;
 
    }

    async getGoogleUser(userId: string): Promise<GoogleUser> {
         const sqlRead =  `
            SELECT token
            FROM tokens
            WHERE user_id = $1
        `

        const result = await this.pool.query(sqlRead, [userId])

        return result.rows[0];
    }
}