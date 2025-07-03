import { Request, Response } from "express";
import HttpService from "../../../core/services/HttpService"
import { BadRequestError, NotFoundError } from "../../../core/errors/errors";
import EventsService from "./EventsService";
import { EventData } from "./events.interface";

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
    try {
      const user = req.user;

      const data = await this.eventsService.collection(user.user_id);

      res.status(200).json({ data: data });
    } catch (error) {
      throw error;
    }
  }

}
