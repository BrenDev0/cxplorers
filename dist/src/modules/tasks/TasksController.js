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
class TasksController {
    constructor(httpService, tasksService) {
        this.block = "tasks.controller";
        this.httpService = httpService;
        this.tasksService = tasksService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const user = req.user;
                const businessId = req.businessId;
                const requiredFields = ["contactId", "businessUserId", "taskTitle", "taskDueDate"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const { contactId, businessUserId } = req.body;
                const [contactResource, userResource] = yield Promise.all([
                    this.httpService.requestValidation.validateResource(contactId, "ContactsService", "Contact not found", block),
                    this.httpService.requestValidation.validateResource(businessUserId, "BusinessUsersService", "Business user not found", block)
                ]);
                this.httpService.requestValidation.validateActionAuthorization(businessId, contactResource.businessId, block);
                this.httpService.requestValidation.validateActionAuthorization(businessId, userResource.businessId, block);
                const taskData = Object.assign(Object.assign({}, req.body), { businessId });
                yield this.tasksService.create(taskData);
                res.status(200).json({ message: "Task added" });
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
                const businessId = req.businessId;
                const taskId = req.params.taskId;
                this.httpService.requestValidation.validateUuid(taskId, "taskId", block);
                const taskResource = yield this.httpService.requestValidation.validateResource(taskId, "TasksService", "Task not found", block);
                this.httpService.requestValidation.validateActionAuthorization(businessId, taskResource.businessId, block);
                res.status(200).json({ data: taskResource });
            }
            catch (error) {
                throw error;
            }
        });
    }
    collectionRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.collectionRequest`;
            try {
                const user = req.user;
                const businessId = req.businessId;
                const businessUserId = req.businessUserId;
                let whereCol;
                let identifier;
                const allwedQueries = ["business", "user"];
                const query = req.query.col;
                if (!allwedQueries.includes(query)) {
                    throw new errors_1.BadRequestError("invalid query");
                }
                if (query === "user") {
                    whereCol = "business_user_id";
                    identifier = businessUserId;
                }
                else {
                    whereCol = "business_id";
                    identifier = businessId;
                }
                const data = yield this.tasksService.collection(whereCol, identifier);
                res.status(200).json({ data });
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.updateRequest`;
            try {
                const user = req.user;
                const businessId = req.businessId;
                const taskId = req.params.taskId;
                this.httpService.requestValidation.validateUuid(taskId, "taskId", block);
                const taskResource = yield this.httpService.requestValidation.validateResource(taskId, "TasksService", "Task not found", block);
                this.httpService.requestValidation.validateActionAuthorization(businessId, taskResource.businessId, block);
                const allowedChanges = ["taskTitle", "taskDescription", "taskDueDate", "businessUserId"];
                const filteredChanges = this.httpService.requestValidation.filterUpdateRequest(allowedChanges, req.body, block);
                yield this.tasksService.update(taskId, filteredChanges);
                res.status(200).json({ message: "Task updated" });
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.deleteRequest`;
            try {
                const user = req.user;
                const businessId = req.businessId;
                const taskId = req.params.taskId;
                this.httpService.requestValidation.validateUuid(taskId, "taskId", block);
                const taskResource = yield this.httpService.requestValidation.validateResource(taskId, "TasksService", "Task not found", block);
                this.httpService.requestValidation.validateActionAuthorization(businessId, taskResource.businessId, block);
                yield this.tasksService.delete(taskId);
                res.status(200).json({ message: "Task deleted." });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = TasksController;
