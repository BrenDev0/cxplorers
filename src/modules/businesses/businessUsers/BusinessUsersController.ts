import { Request, Response } from "express";
import HttpService from "../../../core/services/HttpService"
import { BadRequestError, NotFoundError } from "../../../core/errors/errors";
import BusinessUsersService from "./BusienssUsersService";
import { BusinessUserData } from "./businessUsers.interface";
import Container from "../../../core/dependencies/Container";
import UsersService from "../../users/UsersService";

export default class BusinessUsersController { 
  private httpService: HttpService;
  private businessUsersService: BusinessUsersService;  
  private block = "businessUsers.controller"; 
  

  constructor(httpService: HttpService, businessUsersService: BusinessUsersService) {
    this.httpService = httpService;
    this.businessUsersService = businessUsersService;
  }

  async createRequest(req: Request, res: Response): Promise<void> {
      const block = `${this.block}.createRequest`;
      try {
        const user = req.user;
        const businessId = req.businessId;

        const requiredFields = ["email", "password", "name", "phone", "accountType"];
        this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

        const usersService = Container.resolve<UsersService>("UsersService");
        const newUser = await usersService.create(req.body);
        
        const { accountType } = req.body;
        await this.businessUsersService.create({
          accountType,
          businessId,
          userId: newUser.user_id
        })

        res.status(200).json({ message: "User added to business." });
      } catch (error) {
        throw error;
      }
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
