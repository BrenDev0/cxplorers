import { Request, Response } from "express";
import HttpService from "../../../core/services/HttpService"
import { AuthorizationError, BadRequestError, NotFoundError } from "../../../core/errors/errors";
import BusinessUsersService from "./BusinessUsersService";
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
        const businessId = req.businessId

        const businessUser = await this.businessUsersService.selectByIds(user.user_id, businessId);
       
        if(!businessUser || businessUser.role !== "owner") {
          throw new AuthorizationError()
        }

        const requiredFields = ["email", "password", "name", "phone", "role"];
        this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

        const { email, password, role } = req.body;

        const encryptedEmail = this.httpService.encryptionService.encryptData(email);

        const usersService = Container.resolve<UsersService>("UsersService");
        
        const emailInUse = await usersService.resource("email", encryptedEmail);
        
        if(emailInUse) {
          throw new BadRequestError("Email in use")
        }

        const hashedPassword = await this.httpService.passwordService.hashPassword(password);
        const newUser = await usersService.create({
          ...req.body,
          password: hashedPassword
        });

        

        const newBusinessUser = await this.businessUsersService.create({
          role: role.toLowerCase(),
          businessId,
          userId: newUser.user_id
        })

        res.status(200).json({ 
          message: "User added to business.",
          businessUserId:  newBusinessUser.business_user_id
        });
      } catch (error) {
        throw error;
      }
  }

  async collectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const buisnessId = req.businessId;

      const data = await this.businessUsersService.collection("business_id", buisnessId);

      res.status(200).json({ data })
    } catch (error) {
      throw error;
    }
  }

  async readRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      const data = await this.businessUsersService.read(user.user_id);

      res.status(200).json({ data })
    } catch (error) {
      throw error
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
