import { Pool } from "pg";
import BaseRepository from "../../../core/repository/BaseRepository";
import { EventAttendee, IEventAttendeesRepository } from "./eventAttendees.interface";

export default class EventAttendeesRepositoy extends BaseRepository<EventAttendee> implements IEventAttendeesRepository<EventAttendee> {
    constructor(pool: Pool) {
        super(pool, "event_attendees")
    }
    async upsert(cols: string[], values: any[]): Promise<EventAttendee[]> {
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
            ON CONFLICT (contact_id, event_id) DO UPDATE SET
            status = EXCLUDED.status
            RETURNING *
        `;

        const result = await this.pool.query(
            sqlInsert,
            values
        );

        return result.rows;
    }

    async getAll(businessId: string): Promise<EventAttendee[]> {
        const sqlRead =  `
            SELECT event_attendees.status, contacts.name, events.summary, calendars.title
            FROM event_attendees
            JOIN events ON event_attendees.event_id = events.event_id
            JOIN calendars ON events.calendar_id = calendars.calendar_id
            JOIN businesses ON calendars.business_id = businesses.business_id
            WHERE businesses.business_id = $1
        `;

        const result = await this.pool.query(sqlRead, [businessId]);

        return result.rows;
    }

    async deleteOne(contactId: string, eventId: string): Promise<EventAttendee> {
        const sqlDelete = `
            DELETE FROM event_attendees WHERE contact_id = $1 AND event_id = $2
        `

        const result = await this.pool.query(sqlDelete, [contactId, eventId]);

        return result.rows[0]
    }
}