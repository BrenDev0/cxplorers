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
class ContactsRepository extends BaseRepository_1.default {
    constructor(pool) {
        super(pool, "contacts");
    }
    upsert(cols, values, conflict) {
        return __awaiter(this, void 0, void 0, function* () {
            const numCols = cols.length;
            const numRows = values.length / numCols;
            // Build multi-row placeholders like: ($1, $2), ($3, $4), ...
            const insertPlaceholders = Array.from({ length: numRows }, (_, rowIdx) => {
                const offset = rowIdx * numCols;
                const row = cols.map((_, colIdx) => `$${offset + colIdx + 1}`);
                return `(${row.join(", ")})`;
            }).join(", ");
            const conflictColIndex = cols.indexOf(conflict);
            if (conflictColIndex === -1)
                throw new Error(`Conflict column '${conflict}' not found in cols`);
            const conflictValues = Array.from({ length: numRows }, (_, i) => values[i * numCols + conflictColIndex]);
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
            const result = yield this.pool.query(sqlInsert, [...values, ...conflictValues]);
            return result.rows;
        });
    }
}
exports.default = ContactsRepository;
