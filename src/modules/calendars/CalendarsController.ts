import { Request, Response } from "express";
import HttpService from "../../core/services/HttpService"
import { AuthorizationError, BadRequestError, NotFoundError } from "../../core/errors/errors";
import CalendarsService from "./CalendarsService";
import { CalendarData } from "./calendars.interface";

export default class CalendarsController { 
  private httpService: HttpService;
  private calendarsService: CalendarsService;  
  private block = "calendars.controller"; 
  

  constructor(httpService: HttpService, calendarsService: CalendarsService) {
    this.httpService = httpService;
    this.calendarsService = calendarsService;
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.createRequest`;
    try {
      const user = req.user;
      const businessId = req.businessId;
      const businessUserId =  req.businessUserId;
      const requiredFields = ["calendarReferenceId", "title"];
      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

      const calendarData = {
        ...req.body,
        businessId,
        businessUserId
      };

      const calendar = await this.calendarsService.create(calendarData);

      res.status(200).json({ 
        message: "Calendar added." ,
        calendarId: calendar.calendar_id
      });
    } catch (error) {
      throw error;
    }
  }

  async resourceRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.resourceRequest`;
    try {
      const user = req.user;
      const businessId = req.businessId;
      const calendarId = req.params.calendarId;
      this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);

      const resource = await this.httpService.requestValidation.validateResource<CalendarData>(calendarId, "CalendarsService", "Calendar not found", block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, resource.businessId, block);

      res.status(200).json({ data: resource })
    } catch (error) {
      throw error;
    }
  }

  async collectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const businessUserId = req.businessUserId;

      const data = await this.calendarsService.collection(user.user_id);
  
      res.status(200).json({ data: data });
    } catch (error) {
      throw error;
    }
  }

  // async updateRequest(req: Request, res: Response): Promise<void> {
  //   const block = `${this.block}.updateRequest`;
  //   try { 
  //     const user = req.user;
  //     const calendarId = req.params.calendarId;
  //     this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);

  //     const resource = await this.calendarsService.resource(calendarId);
  //     if(!resource) {
  //       throw new NotFoundError(undefined, {
  //         calendarId,
  //         resource: resource || "Calendar not found"
  //       });
  //     };

  //     if(resource.userId !== user.user_id) {
  //       throw new AuthorizationError(undefined, {
  //         calendarUserId: resource.userId,
  //         requestUserId: user.userId
  //       })
  //     }
  //     const allowedChanges = [""];

  //     const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<CalendarData>(allowedChanges, req.body, block);

  //     await this.calendarsService.update(filteredChanges);

  //     res.status(200).json({ message: "updated" });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async deleteRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.deleteRequest`;
    try {
      const user = req.user;
      const businessId = req.businessId;
      const calendarId = req.params.calendarId;
      this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);

     const resource = await this.httpService.requestValidation.validateResource<CalendarData>(calendarId, "CalendarsService", "Calendar not found", block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, resource.businessId, block);

      await this.calendarsService.delete(calendarId);
      res.status(200).json({ message: "Calendar deleted"})
    } catch (error) {
      throw error;
    }
  }
}
