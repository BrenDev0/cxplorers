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
class EventAttendeesController {
    constructor(httpService, eventAttendeesService) {
        this.block = "eventAtendees.controller";
        this.httpService = httpService;
        this.eventAttendeesService = eventAttendeesService;
    }
    // async createRequest(req: Request, res: Response): Promise<void> {
    //   const block = `${this.block}.createRequest`;
    //   try {
    //     const requiredFields = [""];
    //     const eventAttendeeData = {
    //     };
    //     await this.eventAttendeesService.create(eventAttendeeData);
    //     res.status(200).json({ message: " added." });
    //   } catch (error) {
    //     throw error;
    //   }
    // }
    // async resourceRequest(req: Request, res: Response): Promise<void> {
    //   const block = `${this.block}.resourceRequest`;
    //   try {
    //   } catch (error) {
    //     throw error;
    //   }
    // }
    // async updateRequest(req: Request, res: Response): Promise<void> {
    //   const block = `${this.block}.updateRequest`;
    //   try { 
    //    const resource = await this.eventAttendeesService.resource();
    //     if (!resource) {
    //       throw new NotFoundError(undefined, {
    //         block: `${block}.notFound`,
    //       });
    //     }
    //     const allowedChanges = [""];
    //     const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<EventAttendeeData>(allowedChanges, req.body, block);
    //     await this.eventtAtendeesService.update(filteredChanges);
    //     res.status(200).json({ message: "updated" });
    //   } catch (error) {
    //     throw error;
    //   }
    // }
    // async deleteRequest(req: Request, res: Response): Promise<void> {
    //   const block = `${this.block}.deleteRequest`;
    //   try {
    //   } catch (error) {
    //     throw error;
    //   }
    // }
    readRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const businessId = req.businessId;
                const data = yield this.eventAttendeesService.read(businessId);
                res.status(200).json({ data });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = EventAttendeesController;
