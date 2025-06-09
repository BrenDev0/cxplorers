import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { Contact, ContactData, IContactsRepository } from "./contacts.interface";

export default class ContactsRepository extends BaseRepository<Contact> implements IContactsRepository<Contact> {
    constructor(pool: Pool) {
        super(pool, "contacts")
    }

    async upsert(cols: string[], values: any[], conflict: string): Promise<Contact[]> {
        const numCols = cols.length;
        const numRows = values.length / numCols;

        // Build multi-row placeholders like: ($1, $2), ($3, $4), ...
        const insertPlaceholders = Array.from({ length: numRows }, (_, rowIdx) => {
            const offset = rowIdx * numCols;
            const row = cols.map((_, colIdx) => `$${offset + colIdx + 1}`);
            return `(${row.join(", ")})`;
        }).join(", ");

        const conflictColIndex = cols.indexOf(conflict);
        if (conflictColIndex === -1) throw new Error(`Conflict column '${conflict}' not found in cols`);

      
        const conflictValues = Array.from({ length: numRows }, (_, i) =>
            values[i * numCols + conflictColIndex]
        );

        const conflictPlaceholders = conflictValues
            .map((_, i) => `$${values.length + i + 1}`)
            .join(", ");

        const sqlInsert = `
            WITH inserted AS (
                INSERT INTO ${this.table}
                (${cols.join(", ")})
                values ${insertPlaceholders}
                ON CONFLICT (${conflict}) DO NOTHING
                RETURNING contact_id, email
            )
            SELECT contact_id, email FROM inserted
            UNION
            SELECT contact_id, email FROM ${this.table}
            WHERE ${conflict} IN (${conflictPlaceholders});
        `;

        const result = await this.pool.query(
            sqlInsert,
            [ ...values, ...conflictValues]
        );

        return result.rows;
    }
}