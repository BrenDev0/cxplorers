import { Request, Response } from "express";
import HttpService from "../../../core/services/HttpService"
import { BadRequestError, NotFoundError } from "../../../core/errors/errors";
import EventsService from "./EventsService";
import { EventData } from "./events.interface";
import { CalendarData } from "../calendars.interface";

export default class EventsController { 
  private httpService: HttpService;
  private eventsService: EventsService;  
  private block = "events.controller"; 
  

  constructor(httpService: HttpService, eventsService: EventsService) {
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

  async collectionRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.collectionRequest`
    try {
      const user = req.user;
      const businessId = req.businessId;

      const calendarId = req.params.calendarId;
      this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);

      const calendarResource = await this.httpService.requestValidation.validateResource<CalendarData>(calendarId, "CalendarsService", "Calendar not found" , block)
      this.httpService.requestValidation.validateActionAuthorization(businessId, calendarResource.businessId, block);

      const data = await this.eventsService.collection(calendarId);

      res.status(200).json({ data: data });
    } catch (error) {
      throw error;
    }
  }

}
