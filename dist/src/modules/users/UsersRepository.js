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
class UsersRepository extends BaseRepository_1.default {
    constructor(pool) {
        super(pool, "users");
    }
    getGoogleData(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlRead = `
            SELECT users.*, tokens.token
            FROM users
            LEFT JOIN tokens ON users.user_id = tokens.user_id AND tokens.service = "GOOGLE"
            WHERE users.user_id = $1
        `;
            const result = yield this.pool.query(sqlRead, [userId]);
            return result.rows[0];
        });
    }
}
exports.default = UsersRepository;
