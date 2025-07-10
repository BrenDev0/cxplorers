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
        super(pool, "taggings");
    }
    resource(tagId, contactId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlRead = `
            SELECT * FROM ${this.table}
            WHERE tag_id = $1 AND contact_id = $2;
        `;
            const result = yield this.pool.query(sqlRead, [tagId, contactId]);
            return result.rows[0] || null;
        });
    }
    deleteByIds(tagId, contactId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlDelete = `
            DELETE FROM ${this.table}
            WHERE tag_id = $1 AND contact_id = $2
        `;
            const result = yield this.pool.query(sqlDelete, [tagId, contactId]);
            return result.rows[0];
        });
    }
}
exports.default = TaggingsRepository;
