import { Request, Response } from "express";
import HttpService from "../../core/services/HttpService"
import { BadRequestError, NotFoundError } from "../../core/errors/errors";
import TasksService from "./TasksService";
import { TaskData } from "./tasks.interface";
import { Contact, ContactData } from "../contacts/contacts.interface";

export default class TasksController { 
  private httpService: HttpService;
  private tasksService: TasksService;  
  private block = "tasks.controller"; 
  

  constructor(httpService: HttpService, tasksService: TasksService) {
    this.httpService = httpService;
    this.tasksService = tasksService;
  }

  // async createRequest(req: Request, res: Response): Promise<void> {
  //   const block = `${this.block}.createRequest`;
  //   try {
  //     const user = req.user;
  //     const businessId = req.businessId;
      
  //     const requiredFields = ["contactId", "userId", "taskTitle", "taskDueDate"];
  //     this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

  //     const { contactId, userId } = req.body;

  //     const contactResource = await this.httpService.requestValidation.validateResource<ContactData>(contactId, "ContactsService", "Contact not found", block) 

  //     const taskData = {
        
  //     };

  //     await this.tasksService.create(taskData);

  //     res.status(200).json({ message: "Task added" });
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
  //    const resource = await this.tasksService.resource();
  //     if (!resource) {
  //       throw new NotFoundError(undefined, {
  //         block: `${block}.notFound`,
  //       });
  //     }
  //     const allowedChanges = [""];

  //     const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<TasksData>(allowedChanges, req.body, block);

  //     await this.tasksService.update(filteredChanges);

  //     res.status(200).json({ message: "Task updated" });
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
}
