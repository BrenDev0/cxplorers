import { Request, Response } from "express";
import HttpService from "../../../core/services/HttpService"
import { BadRequestError, NotFoundError } from "../../../core/errors/errors";
import EventAttendeesService from "./EventAttendeesService";
import { EventAttendeeData } from "./eventAttendees.interface";

export default class EventAttendeesController { 
  private httpService: HttpService;
  private eventAttendeesService: EventAttendeesService;  
  private block = "eventAtendees.controller"; 
  

  constructor(httpService: HttpService, eventAttendeesService: EventAttendeesService) {
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
}
