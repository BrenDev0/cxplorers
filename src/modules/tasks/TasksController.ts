import { Request, Response } from "express";
import HttpService from "../../core/services/HttpService"
import { BadRequestError, NotFoundError } from "../../core/errors/errors";
import TasksService from "./TasksService";
import { TaskData } from "./tasks.interface";
import { Contact, ContactData } from "../contacts/contacts.interface";
import { BusinessUser, BusinessUserData } from "../businesses/businessUsers/businessUsers.interface";
import Container from "../../core/dependencies/Container";
import BusinessUsersService from "../businesses/businessUsers/BusinessUsersService";

export default class TasksController { 
  private httpService: HttpService;
  private tasksService: TasksService;  
  private block = "tasks.controller"; 
  

  constructor(httpService: HttpService, tasksService: TasksService) {
    this.httpService = httpService;
    this.tasksService = tasksService;
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.createRequest`;
    try {
      const user = req.user;
      const businessId = req.businessId;
      
      const requiredFields = ["contactId", "businessUserId", "taskTitle", "taskDueDate"];
      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

      const { contactId, businessUserId } = req.body;

      const [contactResource, userResource] = await  Promise.all([
        this.httpService.requestValidation.validateResource<ContactData>(contactId, "ContactsService", "Contact not found", block),
        this.httpService.requestValidation.validateResource<BusinessUserData>(businessUserId, "BusinessUsersService", "Business user not found", block)
      ])

      this.httpService.requestValidation.validateActionAuthorization(businessId, contactResource.businessId, block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, userResource.businessId, block)

      const taskData = {
        ...req.body,
        businessId
      } 
      await this.tasksService.create(taskData);

      res.status(200).json({ message: "Task added" });
    } catch (error) {
      throw error;
    }
  }

  async resourceRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.resourceRequest`;
    try {
      const user = req.user;
      const businessId = req.businessId;
      
      const taskId = req.params.taskId;
      this.httpService.requestValidation.validateUuid(taskId, "taskId", block);

      const taskResource = await this.httpService.requestValidation.validateResource<TaskData>(taskId, "TasksService", "Task not found", block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, taskResource.businessId, block);

      res.status(200).json({ data: taskResource })
    } catch (error) {
      throw error;
    }
  }

   async collectionRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.collectionRequest`;
    try {
      const user = req.user;
      const businessId = req.businessId;
      const businessUserId = req.businessUserId;
      
      let whereCol;
      let identifier;
      const allwedQueries = ["business", "user"];
      const query = req.query.col as string;

      if(!allwedQueries.includes(query)) {
        throw new BadRequestError("invalid query")
      }

      if(query === "user") {
        whereCol = "business_user_id";

        identifier = businessUserId;
      } else {
        whereCol = "business_id";
        identifier = businessId
      }

      const data = await this.tasksService.collection(whereCol, identifier);

      res.status(200).json({ data })
    } catch (error) {
      throw error;
    }
  }

  async updateRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.updateRequest`;
    try { 
      const user = req.user;
      const businessId = req.businessId;
      
      const taskId = req.params.taskId;
      this.httpService.requestValidation.validateUuid(taskId, "taskId", block);

      const taskResource = await this.httpService.requestValidation.validateResource<TaskData>(taskId, "TasksService", "Task not found", block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, taskResource.businessId, block);

      const allowedChanges = ["taskTitle", "taskDescription", "taskDueDate", "businessUserId"];

      const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<TaskData>(allowedChanges, req.body, block);

      await this.tasksService.update(taskId, filteredChanges);

      res.status(200).json({ message: "Task updated" });
    } catch (error) {
      throw error;
    }
  }

  async deleteRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.deleteRequest`;
    try {
     const user = req.user;
      const businessId = req.businessId;
      
      const taskId = req.params.taskId;
      this.httpService.requestValidation.validateUuid(taskId, "taskId", block);

      const taskResource = await this.httpService.requestValidation.validateResource<TaskData>(taskId, "TasksService", "Task not found", block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, taskResource.businessId, block);

      await this.tasksService.delete(taskId);
      
      res.status(200).json({ message: "Task deleted." })
    } catch (error) {
      throw error;
    }
  }
}
