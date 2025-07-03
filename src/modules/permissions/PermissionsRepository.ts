import { Pool } from "pg";
import { IPermissionsRepository, Permission } from "./permissions.interface";
import BaseRepository from "../../core/repository/BaseRepository";

export default class PermissionsRepository extends BaseRepository<Permission> implements IPermissionsRepository {
    constructor(pool: Pool) {
        super(pool, "permissions")
    }

    async upsert(cols: string[], values: Permission[]): Promise<Permission[]> {
        const numCols = cols.length;
        const numRows = values.length / numCols;

        const placeholders = Array.from({ length: numRows }, (_, rowIdx) => {
            const offset = rowIdx * numCols;
            const row = cols.map((_, colIdx) => `$${offset + colIdx + 1}`);
            return `(${row.join(", ")})`;
        }).join(", ");


        const sqlInsert =  `
            INSERT INTO ${this.table}
            (${cols.join(", ")})
            values ${placeholders}
            ON CONFLICT (permission_id) DO UPDATE SET
            name = EXCLUDED.name,
            action = EXCLUDED.action
            RETURNING *
        `;

        const result = await this.pool.query(sqlInsert, values);

        return result.rows 
    }
}