import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { Task } from "./tasks.interface";
import TasksService from "./TasksService";
import TasksController from "./TasksController";
import Container from "../../core/dependencies/Container";
import HttpService from "../../core/services/HttpService";

export function configureTasksDependencies(pool: Pool): void {
    const repository = new BaseRepository<Task>(pool, "tasks");
    const service = new TasksService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new TasksController(httpService, service);

    Container.register<TasksService>("TasksService", service);
    Container.register<TasksController>("TasksController", controller);
    return;
}
