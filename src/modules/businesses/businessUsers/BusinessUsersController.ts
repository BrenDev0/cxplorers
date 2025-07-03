import { Request, Response } from "express";
import HttpService from "../../../core/services/HttpService"
import { BadRequestError, NotFoundError } from "../../../core/errors/errors";
import BusinessUsersService from "./BusinessUsersService";
import { BusinessUserData } from "./businessUsers.interface";

export default class BusinessUsersController { 
  private httpService: HttpService;
  private businessUsersService: BusinessUsersService;  
  private block = "businessUsers.controller"; 
  

  constructor(httpService: HttpService, businessUsersService: BusinessUsersService) {
    this.httpService = httpService;
    this.businessUsersService = businessUsersService;
  }

 
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
    
  //     const allowedChanges = [""];

  //     const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<BusinessUserData>(allowedChanges, req.body, block);

  //     await this.businessUsersService.update(filteredChanges);

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
