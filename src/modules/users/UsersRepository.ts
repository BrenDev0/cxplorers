import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { Google } from "../google/google.interface";
import { UserData, User, UserGoogleData, IUserRepository } from "./users.interface";

export default class UsersRepository extends BaseRepository<UserData> implements IUserRepository<User> {
    constructor(pool: Pool) {
        super(pool, "users")
    }
    async getGoogleData(userId: string): Promise<UserGoogleData> {
        const sqlRead =  `
            SELECT users.*, tokens.token
            FROM users
            LEFT JOIN tokens ON users.user_id = tokens.user_id AND tokens.service = "GOOGLE"
            WHERE users.user_id = $1
        `

        const result = await this.pool.query(sqlRead, [userId])
        return result.rows[0];
    }
}