"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
const createApp = () => {
    const app = (0, express_1.default)();
    const allowedOrigins = [
        "http://localhost:3000"
    ];
    app.use((0, cors_1.default)({
        origin: allowedOrigins,
        credentials: true
    }));
    app.use((0, helmet_1.default)());
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200, // Limit each IP to 200 requests per windowMs
        message: "Too many requests, please try again later.",
    });
    app.use(limiter);
    app.set('trust proxy', 1);
    app.use(express_1.default.json({ limit: '50mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
    return app;
};
exports.default = createApp;
