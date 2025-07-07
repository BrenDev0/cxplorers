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
const Container_1 = __importDefault(require("../dependencies/Container"));
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
    validateResource(resourceId_1, serviceKey_1) {
        return __awaiter(this, arguments, void 0, function* (resourceId, serviceKey, notFoundMessage = "Resource not found", block) {
            const service = Container_1.default.resolve(serviceKey);
            const resource = yield service.resource(resourceId);
            if (!resource) {
                throw new errors_1.NotFoundError(notFoundMessage, {
                    block
                });
            }
            return resource;
        });
    }
    validateActionAuthorization(id, resourceId, block) {
        if (id !== resourceId) {
            throw new errors_1.AuthorizationError(undefined, {
                block
            });
        }
    }
}
exports.default = HttpRequestValidationService;
