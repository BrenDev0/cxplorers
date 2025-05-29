"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class EncryptionService {
    constructor() {
        if (!process.env.ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY environment variable is not set');
        }
        this.encryptionKey = process.env.ENCRYPTION_KEY;
        // Use a fixed IV to ensure the same result every time for the same data
        this.iv = Buffer.from('1234567890abcdef1234567890abcdef', 'hex');
    }
    encryptData(data) {
        try {
            const dataStr = String(data);
            // Use the fixed IV for encryption
            const cipher = crypto_1.default.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'utf-8'), this.iv);
            let encrypted = cipher.update(dataStr, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return encrypted;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    decryptData(encryptedData) {
        try {
            const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'utf-8'), this.iv);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
}
exports.default = EncryptionService;
