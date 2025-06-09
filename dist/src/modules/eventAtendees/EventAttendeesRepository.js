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
const BaseRepository_1 = __importDefault(require("../../core/repository/BaseRepository"));
class EventAttendeesRepositoy extends BaseRepository_1.default {
    constructor(pool) {
        super(pool, "event_attendees");
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
            ON CONFLICT (contact_id, event_id) DO UPDATE SET
            status = EXCLUDED.status
            RETURNING *
        `;
            const result = yield this.pool.query(sqlInsert, values);
            return result.rows;
        });
    }
}
exports.default = EventAttendeesRepositoy;
