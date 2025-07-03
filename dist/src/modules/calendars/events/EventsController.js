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
class EventsController {
    constructor(httpService, eventsService) {
        this.block = "events.controller";
        this.httpService = httpService;
        this.eventsService = eventsService;
    }
    // async resourceRequest(req: Request, res: Response): Promise<void> {
    //   const block = `${this.block}.resourceRequest`;
    //   try {
    //   } catch (error) {
    //     throw error;
    //   }
    // }
    collectionRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const data = yield this.eventsService.collection(user.user_id);
                res.status(200).json({ data: data });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = EventsController;
