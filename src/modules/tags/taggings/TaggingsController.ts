import { Request, Response } from "express";
import HttpService from "../../../core/services/HttpService"
import { BadRequestError, NotFoundError } from "../../../core/errors/errors";
import TaggingsService from "./TaggingsService";
import { TaggingData } from "./taggings.interface";

export default class TaggingsController { 
  private httpService: HttpService;
  private taggingsService: TaggingsService;  
  private block = "taggings.controller"; 
  

  constructor(httpService: HttpService, taggingsService: TaggingsService) {
    this.httpService = httpService;
    this.taggingsService = taggingsService;
  }

  // async createRequest(req: Request, res: Response): Promise<void> {
  //   const block = `${this.block}.createRequest`;
  //   try {
  //     const requiredFields = ["tagId", "resourceId", "resourceType"];


  //     const taggingData = {
    
  //     };

  //     await this.taggingsService.create(taggingData);

  //     res.status(200).json({ message: "Tagging added" });
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
  //    const resource = await this.taggingsService.resource();
  //     if (!resource) {
  //       throw new NotFoundError(undefined, {
  //         block: `${block}.notFound`,
  //       });
  //     }
  //     const allowedChanges = [""];

  //     const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<TaggingsData>(allowedChanges, req.body, block);

  //     await this.taggingsService.update(filteredChanges);

  //     res.status(200).json({ message: "Tagging updated" });
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
