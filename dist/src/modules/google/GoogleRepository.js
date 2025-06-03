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
exports.GoogleRepository = void 0;
class GoogleRepository {
    constructor(pool) {
        this.pool = pool;
    }
    getGoogleUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlRead = `
            SELECT token AS refresh_token
            FROM tokens
            WHERE user_id = $1
        `;
            const result = yield this.pool.query(sqlRead, [userId]);
            return result.rows[0];
        });
    }
}
exports.GoogleRepository = GoogleRepository;
