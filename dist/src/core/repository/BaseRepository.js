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
Object.defineProperty(exports, "__esModule", { value: true });
class BaseRepository {
    constructor(pool, table) {
        this.pool = pool;
        this.table = table;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const cols = Object.keys(data);
            const values = Object.values(data);
            const placeholders = cols.map((_, i) => `$${i + 1}`);
            const sqlInsert = `
            INSERT INTO ${this.table}
            (${cols.join(", ")})
            values (${placeholders})
            RETURNING *;
        `;
            const result = yield this.pool.query(sqlInsert, values);
            return result.rows[0];
        });
    }
    selectOne(whereCol, identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlSelect = `
            SELECT * FROM ${this.table}
            WHERE ${whereCol} = $1;
        `;
            const result = yield this.pool.query(sqlSelect, [identifier]);
            return result.rows[0] || null;
        });
    }
    select(whereCol, identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlSelect = `
            SELECT * FROM ${this.table}
            WHERE ${whereCol} = $1;
        `;
            const result = yield this.pool.query(sqlSelect, [identifier]);
            return result.rows;
        });
    }
    update(whereCol, identifier, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const clauses = Object.keys(changes).map((key, i) => `${key} = $${i + 1}`);
            let values = Object.values(changes);
            const sqlUpdate = `
            UPDATE ${this.table}
            SET ${clauses}
            WHERE ${whereCol} = $${Object.keys(changes).length + 1}
            RETURNING *;
        `;
            values.push(identifier);
            const result = yield this.pool.query(sqlUpdate, values);
            return result.rows[0];
        });
    }
    delete(whereCol, identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlDelete = `
            DELETE FROM ${this.table} 
            WHERE ${whereCol} = $1 
            RETURNING *;
        `;
            const result = yield this.pool.query(sqlDelete, [identifier]);
            return result.rows.length > 1 ? result.rows : result.rows[0];
        });
    }
}
exports.default = BaseRepository;
