import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { IStagesRepository, Stage } from "./stages.interface";

export default class StagesRepository extends BaseRepository<Stage> implements IStagesRepository {
    constructor(pool: Pool) {
        super(pool, "stages")
    }

   async createMany(cols: string[], values: Omit<Stage, "stage_id">[]): Promise<Stage[]> {
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
            RETURNING *;
        `;

        const result = await this.pool.query(sqlInsert, values);

        return result.rows 
    }
}