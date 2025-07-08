import { Task, TaskData } from './tasks.interface'
import BaseRepository from "../../core/repository/BaseRepository";
import { handleServiceError } from '../../core/errors/error.service';
import Container from '../../core/dependencies/Container';
import EncryptionService from '../../core/services/EncryptionService';

export default class TasksService {
    private repository: BaseRepository<Task>;
    private block = "tasks.service"
    constructor(repository: BaseRepository<Task>) {
        this.repository = repository
    }

    async create(tasks: Omit<TaskData, "taskId">): Promise<Task> {
        const mappedTask = this.mapToDb(tasks);
        try {
            return this.repository.create(mappedTask as Task);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedTask)
            throw error;
        }
    }

    async resource(taskId: string): Promise<TaskData | null> {
        try {
            const result = await this.repository.selectOne("task_id", taskId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {taskId})
            throw error;
        }
    }

    async update(taskId: string, changes: TaskData): Promise<Task> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        try {
            return await this.repository.update("task_id", taskId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", cleanedChanges)
            throw error;
        }
    }

    async delete(taskId: string): Promise<Task> {
        try {
            return await this.repository.delete("task_id", taskId) as Task;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {taskId})
            throw error;
        }
    }

    mapToDb(task: Omit<TaskData, "taskId">): Omit<Task, "task_id"> {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
           contact_id: task.contactId,
           user_id: task.userId,
           task_title: task.taskTitle,
           task_description: task.taskDescription,
           task_due_date: task.taskDueDate
        }
    }

    mapFromDb(task: Task): TaskData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            taskId: task.task_id,
            contactId: task.contact_id,
            userId: task.user_id,
            taskTitle: task.task_title,
            taskDescription: task.task_description,
            taskDueDate: task.task_due_date
        }
    }
}
