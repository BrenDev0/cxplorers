"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class WebTokenService {
    constructor() {
        if (!process.env.TOKEN_KEY) {
            throw new Error("env variable not set");
        }
        this.tokenKey = process.env.TOKEN_KEY;
    }
    generateToken(payload, expiration = '15m') {
        try {
            const options = {
                expiresIn: expiration
            };
            return jsonwebtoken_1.default.sign(payload, this.tokenKey, options);
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    decodeToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!decoded)
                return null;
            // Check if token is expired
            if (decoded.exp && Date.now() >= decoded.exp * 1000) {
                console.log("Token expired.");
                return null;
            }
            return decoded;
        }
        catch (error) {
            console.log("Error decoding token: ", error);
            return null;
        }
    }
}
exports.default = WebTokenService;
