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
const error_service_1 = require("../../core/errors/error.service");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
class TasksService {
    constructor(repository) {
        this.block = "tasks.service";
        this.repository = repository;
    }
    create(tasks) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedTask = this.mapToDb(tasks);
            try {
                return this.repository.create(mappedTask);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedTask);
                throw error;
            }
        });
    }
    resource(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne("task_id", taskId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { taskId });
                throw error;
            }
        });
    }
    update(taskId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                return yield this.repository.update("task_id", taskId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete("task_id", taskId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { taskId });
                throw error;
            }
        });
    }
    mapToDb(task) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            contact_id: task.contactId,
            user_id: task.userId,
            task_title: task.taskTitle,
            task_description: task.taskDescription,
            task_due_date: task.taskDueDate
        };
    }
    mapFromDb(task) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            taskId: task.task_id,
            contactId: task.contact_id,
            userId: task.user_id,
            taskTitle: task.task_title,
            taskDescription: task.task_description,
            taskDueDate: task.task_due_date
        };
    }
}
exports.default = TasksService;
