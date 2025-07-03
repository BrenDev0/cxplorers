"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRepository_1 = __importDefault(require("../../../core/repository/BaseRepository"));
class EventsRepository extends BaseRepository_1.default {
    constructor(pool) {
        super(pool, "events");
    }
    upsert(cols, values) {
        return __awaiter(this, void 0, void 0, function* () {
            const numCols = cols.length;
            const numRows = values.length / numCols;
            // Build multi-row placeholders like: ($1, $2), ($3, $4), ...
            const placeholders = Array.from({ length: numRows }, (_, rowIdx) => {
                const offset = rowIdx * numCols;
                const row = cols.map((_, colIdx) => `$${offset + colIdx + 1}`);
                return `(${row.join(", ")})`;
            }).join(", ");
            const sqlInsert = `
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
            const result = yield this.pool.query(sqlInsert, values);
            return result.rows;
        });
    }
    resource(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlRead = `
            SELECT events.*, calendars.calendar_reference_id
            FROM events
            JOIN calendars ON events.calendar_id = calendars.calendar_id
            WHERE events.event_id = $1;
        `;
            const result = yield this.pool.query(sqlRead, [eventId]);
            return result.rows[0] || null;
        });
    }
    deleteMany(referenceIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const placeholders = referenceIds.map((_, i) => `$${i + 1}`);
            const sqlDelete = `
            DELETE FROM events
            WHERE event_reference_id NOT IN (${placeholders.join(", ")})
            RETURNING *
        `;
            const result = yield this.pool.query(sqlDelete, referenceIds);
            return result.rows;
        });
    }
}
exports.default = EventsRepository;
