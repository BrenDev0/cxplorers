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
const pg_1 = require("pg");
class Database {
    constructor() {
        this.pool = null;
        this.isconnected = false;
        this.initPromise = null;
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    // default 10sec 
    withTimeout(promise_1) {
        return __awaiter(this, arguments, void 0, function* (promise, timeout = 10000) {
            return Promise.race([
                promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), timeout)),
            ]);
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initPromise !== null) {
                return this.initPromise;
            }
            console.log('Initializing Database...');
            this.initPromise = (() => __awaiter(this, void 0, void 0, function* () {
                try {
                    this.pool = new pg_1.Pool({
                        host: process.env.PGHOST,
                        user: process.env.PGUSER,
                        password: process.env.PGPASSWORD,
                        database: process.env.PGDATABASE,
                        port: 5432,
                        ssl: {
                            rejectUnauthorized: false,
                        }
                    });
                    yield this.withTimeout(this.pool.query('SELECT 1'));
                    this.isconnected = true;
                    console.log("Database Connected.");
                    return;
                }
                catch (error) {
                    console.error('Error initializing the app:', error);
                    this.isconnected = false;
                    this.initPromise = null;
                    throw error;
                }
            }))();
            return this.initPromise;
        });
    }
    getPool() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.isconnected || this.pool === null) {
                    if (this.initPromise === null) {
                        console.log('Reconnecting to the database...');
                    }
                    ;
                    yield this.init();
                }
                return this.pool;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
}
const databaseInstance = Database.getInstance();
exports.default = databaseInstance;
