"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleServiceError = handleServiceError;
const errors_1 = require("./errors");
//  generic error for sercices //
function handleServiceError(error, service, method, params) {
    throw new errors_1.DatabaseError(undefined, {
        originalError: error.message,
        service: service,
        method: method,
        params: params
    });
}
