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
const errors_1 = require("../../core/errors/errors");
class CalendarsController {
    constructor(httpService, calendarsService) {
        this.block = "calendars.controller";
        this.httpService = httpService;
        this.calendarsService = calendarsService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const user = req.user;
                const requiredFields = ["referenceId", "title"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const calendarData = Object.assign(Object.assign({}, req.body), { userId: user.user_id });
                const calendar = yield this.calendarsService.create(calendarData);
                res.status(200).json({
                    message: "Calendar added.",
                    calendarId: calendar.calendar_id
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    resourceRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.resourceRequest`;
            try {
                const user = req.user;
                const calendarId = req.params.calendarId;
                this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);
                const resource = yield this.calendarsService.resource(calendarId);
                if (!resource) {
                    throw new errors_1.NotFoundError(undefined, {
                        calendarId,
                        resource: resource || "Calendar not found"
                    });
                }
                ;
                if (resource.userId !== user.user_id) {
                    throw new errors_1.AuthorizationError(undefined, {
                        calendarUserId: resource.userId,
                        requestUserId: user.userId
                    });
                }
                res.status(200).json({ data: resource });
            }
            catch (error) {
                throw error;
            }
        });
    }
    collectionRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const data = yield this.calendarsService.collection(user.user_id);
                console.log("DATA:::::::::::", data);
                res.status(200).json({ data: data });
            }
            catch (error) {
                throw error;
            }
        });
    }
    // async updateRequest(req: Request, res: Response): Promise<void> {
    //   const block = `${this.block}.updateRequest`;
    //   try { 
    //     const user = req.user;
    //     const calendarId = req.params.calendarId;
    //     this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);
    //     const resource = await this.calendarsService.resource(calendarId);
    //     if(!resource) {
    //       throw new NotFoundError(undefined, {
    //         calendarId,
    //         resource: resource || "Calendar not found"
    //       });
    //     };
    //     if(resource.userId !== user.user_id) {
    //       throw new AuthorizationError(undefined, {
    //         calendarUserId: resource.userId,
    //         requestUserId: user.userId
    //       })
    //     }
    //     const allowedChanges = [""];
    //     const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<CalendarData>(allowedChanges, req.body, block);
    //     await this.calendarsService.update(filteredChanges);
    //     res.status(200).json({ message: "updated" });
    //   } catch (error) {
    //     throw error;
    //   }
    // }
    deleteRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.deleteRequest`;
            try {
                const user = req.user;
                const calendarId = req.params.calendarId;
                this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);
                const resource = yield this.calendarsService.resource(calendarId);
                if (!resource) {
                    throw new errors_1.NotFoundError(undefined, {
                        calendarId,
                        resource: resource || "Calendar not found"
                    });
                }
                ;
                if (resource.userId !== user.user_id) {
                    throw new errors_1.AuthorizationError(undefined, {
                        calendarUserId: resource.userId,
                        requestUserId: user.userId
                    });
                }
                yield this.calendarsService.delete(calendarId);
                res.status(200).json({ message: "Calendar deleted" });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = CalendarsController;
