"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpService {
    constructor(requestValidation, passwordService, webtokenService, encryptionService) {
        this.requestValidation = requestValidation;
        this.passwordService = passwordService;
        this.webtokenService = webtokenService;
        this.encryptionService = encryptionService;
    }
}
exports.default = HttpService;
