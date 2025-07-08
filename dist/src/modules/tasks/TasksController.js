"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TasksController {
    constructor(httpService, tasksService) {
        this.block = "tasks.controller";
        this.httpService = httpService;
        this.tasksService = tasksService;
    }
}
exports.default = TasksController;
