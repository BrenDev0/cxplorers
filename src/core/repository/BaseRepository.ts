import { Pool} from "pg";
import { IRepository } from "./repository.interface";

export default class BaseRepository<T extends Record<string, any>> implements IRepository<T> {
    protected pool: Pool;
    protected readonly table: string;

    constructor(pool: Pool, table:string) {
        this.pool = pool;
        this.table = table;
    }

    async create(data: T): Promise<T> {
        const cols = Object.keys(data);
        const values = Object.values(data);
        const placeholders = cols.map((_, i) => `$${i + 1}`)
        const sqlInsert =  `
            INSERT INTO ${this.table}
            (${cols.join(", ")})
            values (${placeholders})
            RETURNING *;
        `;

        const result = await this.pool.query(
            sqlInsert,
            values
        );

        return result.rows[0];
    }

    async selectOne(whereCol: string, identifier: number | string): Promise<T | null> {
        const sqlSelect = `
            SELECT * FROM ${this.table}
            WHERE ${whereCol} = $1;
        `;

        const result = await this.pool.query(sqlSelect, [identifier]);

        return result.rows[0] || null;
    }

    async select(whereCol: string, identifier:number): Promise<T[]> {
        const sqlSelect = `
            SELECT * FROM ${this.table}
            WHERE ${whereCol} = $1;
        `;

        const result = await this.pool.query(sqlSelect, [identifier]);

        return result.rows;
    }

    async update(whereCol: string, identifier: number | string, changes: Partial<T>): Promise<T> {
        const clauses = Object.keys(changes).map((key, i) => `${key} = $${i + 1}` );
        let values = Object.values(changes);

        const sqlUpdate = `
            UPDATE ${this.table}
            SET ${clauses}
            WHERE ${whereCol} = $${Object.keys(changes).length + 1}
            RETURNING *;
        `;
        
        values.push(identifier);

        const result = await this.pool.query(
            sqlUpdate,
            values
        );

        return result.rows[0];
    }

    async delete(whereCol: string, identifier: number | string): Promise<T | T[]> {
        const sqlDelete = `
            DELETE FROM ${this.table} 
            WHERE ${whereCol} = $1 
            RETURNING *;
        `;

        const result = await this.pool.query(
            sqlDelete,
            [identifier]
        );

        return result.rows.length > 1 ? result.rows : result.rows[0];
    }
}