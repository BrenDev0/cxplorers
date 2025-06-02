"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors/errors");
const validator_1 = require("validator");
class HttpRequestValidationService {
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
    validateUuid(id, idType, block) {
        if (!(0, validator_1.isUUID)(id)) {
            throw new errors_1.InvalidIdError(undefined, {
                block: `${block}.IdValidation`,
                id: id,
                idtype: idType
            });
        }
        return;
    }
    validateRequestBody(requiredFields, requestBody, block) {
        const missingFields = requiredFields.filter((field) => !(field in requestBody));
        if (missingFields.length !== 0) {
            throw new errors_1.BadRequestError("All fields required", {
                block: block,
                missingFields: missingFields.join(", ")
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
}
exports.default = HttpRequestValidationService;
