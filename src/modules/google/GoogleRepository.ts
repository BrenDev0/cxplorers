import { Pool } from "pg";
import { GoogleUser, IGoogleRepository } from "./google.interface";

export class GoogleRepository implements IGoogleRepository {
    private pool: Pool;
    constructor(pool: Pool) {
        this.pool = pool;
 
    }

    async getGoogleUser(userId: string): Promise<GoogleUser> {
         const sqlRead =  `
            SELECT token AS refresh_token, calendars.reference_id
            FROM tokens
            LEFT JOIN calendars ON tokens.user_id = calendars.user_id
            WHERE user_id = $1
        `

        const result = await this.pool.query(sqlRead, [userId])

        return result.rows[0];
    }
}