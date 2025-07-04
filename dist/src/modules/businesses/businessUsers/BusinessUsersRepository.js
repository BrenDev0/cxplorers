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
class BusinessUsersRepository extends BaseRepository_1.default {
    constructor(pool) {
        super(pool, "business_users");
    }
    resource(userId, businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlRead = `
            SELECT * from ${this.table}
            WHERE user_id = $1 AND business_id = $2
        `;
            const result = yield this.pool.query(sqlRead, [userId, businessId]);
            return result.rows[0] || null;
        });
    }
    ownersCollection(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlRead = `
            SELECT * FROM ${this.table}
            WHERE user_id = $1 AND account_type = 'OWNER'
        `;
            const result = yield this.pool.query(sqlRead, [userId]);
            return result.rows;
        });
    }
    updateByIds(userId, businessId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const clauses = Object.keys(changes).map((key, i) => `${key} = $${i + 1}`);
            let values = Object.values(changes);
            const sqlUpdate = `
            UPDATE ${this.table}
            SET ${clauses}
            WHERE user_id = $${Object.keys(changes).length + 1} AND bsuiness_id = $${Object.keys(changes).length + 2}
            RETURNING *;
        `;
            values.push(userId, businessId);
            const result = yield this.pool.query(sqlUpdate, values);
            return result.rows[0];
        });
    }
    deleteByIds(userId, businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlDelete = `
            DELETE FROM ${this.table} 
            WHERE user_id = $1 AND business_id = $2
            RETURNING *;
        `;
            const result = yield this.pool.query(sqlDelete, [userId, businessId]);
            return result.rows[0];
        });
    }
}
exports.default = BusinessUsersRepository;
