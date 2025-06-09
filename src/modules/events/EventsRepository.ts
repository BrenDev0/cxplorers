import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { Event, GoogleEvent, IEventsRepository } from "./events.interface";

export default class EventsRepository extends BaseRepository<Event> implements IEventsRepository<Event> {
    constructor(pool: Pool) {
        super(pool, "events")
    }

    async upsert(cols: string[], values: any[]): Promise<Event[]> {
        
        const numCols = cols.length;
        const numRows = values.length / numCols;

        // Build multi-row placeholders like: ($1, $2), ($3, $4), ...
        const placeholders = Array.from({ length: numRows }, (_, rowIdx) => {
            const offset = rowIdx * numCols;
            const row = cols.map((_, colIdx) => `$${offset + colIdx + 1}`);
            return `(${row.join(", ")})`;
        }).join(", ");


        const sqlInsert =  `
            INSERT INTO ${this.table}
            (${cols.join(", ")})
            values ${placeholders}
            ON CONFLICT (event_reference_id) DO UPDATE SET
            updated_at = EXCLUDED.updated_at,
            summary = EXCLUDED.summary,
            start_time = EXCLUDED.start_time,
            start_timezone = EXCLUDED.start_timezone,
            end_time = EXCLUDED.end_time,
            end_timezone = EXCLUDED.end_timezone,
            status = EXCLUDED.status
            RETURNING *
        `;

        const result = await this.pool.query(
            sqlInsert,
            values
        );

        return result.rows;
    }

    async resource(eventId: string): Promise<Event | null> {
        const sqlRead =  `
            SELECT events.*, calendars.calendar_reference_id
            FROM events
            JOIN calendars ON events.calendar_id = calendars.calendar_id
            WHERE events.event_id = $1;
        `
        const result = await this.pool.query(sqlRead, [eventId]);
        return result.rows[0] || null
    }
    
    async deleteMany(referenceIds: string[]): Promise<Event[]> {
        const placeholders = referenceIds.map((_, i) => `$${i + 1}`)
        const sqlDelete = `
            DELETE FROM events
            WHERE event_reference_id NOT IN (${placeholders.join(", ")})
            RETURNING *
        `

        const result = await this.pool.query(sqlDelete, referenceIds);

        return result.rows;
    }
}