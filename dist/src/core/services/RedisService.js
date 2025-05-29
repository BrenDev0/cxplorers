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
const redis_1 = require("redis");
class RedisService {
    constructor(connectionUrl) {
        this.connectionUrl = connectionUrl;
    }
    createClient() {
        return __awaiter(this, void 0, void 0, function* () {
            const redisClient = (0, redis_1.createClient)({
                url: this.connectionUrl,
            });
            redisClient.on('end', () => {
                console.log('Disconnected from Redis');
            });
            redisClient.on('connect', () => console.log('Connected to redis'));
            yield redisClient.connect().catch(console.error);
            return redisClient;
        });
    }
}
exports.default = RedisService;
