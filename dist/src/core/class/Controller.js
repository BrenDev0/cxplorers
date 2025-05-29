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
const errors_1 = require("../errors/errors");
const EncryptionService_1 = __importDefault(require("../services/EncryptionService"));
const WebtokenService_1 = __importDefault(require("../services/WebtokenService"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class Controller {
    constructor() {
        this.errorMessage = "Unable to process request";
        this.webtokenService = new WebtokenService_1.default();
        this.encryptionService = new EncryptionService_1.default();
    }
    ;
    validateId(id, idType, block) {
        if (isNaN(id)) {
            throw new errors_1.InvalidIdError(undefined, {
                block: `${block}.IdValidation`,
                id: id,
                idtype: idType
            });
        }
        return;
    }
    filterUpdateRequest(allowedChanges, requestBody, block) {
        const filteredBody = {};
        for (const key of allowedChanges) {
            if (key in requestBody) {
                filteredBody[key] = requestBody[key];
            }
        }
        ;
        if (Object.keys(filteredBody).length === 0) {
            throw new errors_1.BadRequestError("Invalid or empty request body", {
                block: `${block}.filteredDataValidation`,
                request: requestBody,
                filteredBody: filteredBody
            });
        }
        ;
        return filteredBody;
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                return hashedPassword;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    comparePassword(password, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield bcrypt_1.default.compare(password, hash);
                return results;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
}
exports.default = Controller;
