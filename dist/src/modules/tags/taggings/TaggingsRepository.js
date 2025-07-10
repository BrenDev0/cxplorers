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
class TaggingsRepository extends BaseRepository_1.default {
    constructor(pool) {
        super(pool, "tagged_items");
    }
    resource(tagId, resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlRead = `
            SELECT * FROM ${this.table}
            WHERE tag_id = $1 AND resource_id = $2;
        `;
            const result = yield this.pool.query(sqlRead, [tagId, resourceId]);
            return result.rows[0] || null;
        });
    }
    collection(businessId, filterKey, filterValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlRead = `
            SELECT ${this.table}.*  
            from ${this.table}
            JOIN tags ON ${this.table}.tag_id = tags.tag_id
            JOIN businesses ON tags.business_id = businesses.business_id
            WHERE businesses.business_id = $1 AND  = ${this.table}.${filterKey} = $2;
        `;
            const result = yield this.pool.query(sqlRead, [businessId, filterValue]);
            return result.rows;
        });
    }
    deleteByIds(tagId, resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlDelete = `
            DELETE FROM ${this.table}
            WHERE tag_id = $1 AND resource_id = $2
        `;
            const result = yield this.pool.query(sqlDelete, [tagId, resourceId]);
            return result.rows[0];
        });
    }
}
exports.default = TaggingsRepository;
