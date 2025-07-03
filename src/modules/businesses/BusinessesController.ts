import { Request, Response } from "express";
import HttpService from "../../core/services/HttpService"
import { AuthorizationError, BadRequestError, NotFoundError } from "../../core/errors/errors";
import BusinessesService from "./BusinessesService";
import { Business, BusinessData } from "./businesses.interface";
import Container from "../../core/dependencies/Container";
import BusinessUserService from "./businessUsers/BusinessUsersService";
import { BusinessUserData } from "./businessUsers/businessUsers.interface";

export default class BusinessesController { 
  private httpService: HttpService;
  private businessesService: BusinessesService;  
  private block = "businesses.controller"; 
  

  constructor(httpService: HttpService, businessesService: BusinessesService) {
    this.httpService = httpService;
    this.businessesService = businessesService;
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.createRequest`;
    try {
      const user = req.user;
      
      const requiredFields = ["legalName", "businessEmail"];
      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

      const newBusiness = await this.businessesService.create(req.body);
      
      const businessUsersService = Container.resolve<BusinessUserService>("BusinessUsersService");

      const businessUserData: BusinessUserData =  {
        userId: user.user_id,
        businessId: newBusiness.business_id,
        accountType: "OWNER"
      }
      await businessUsersService.create(businessUserData)

      res.status(200).json({ message: "Business added." });
    } catch (error) {
      throw error;
    }
  }

  async resourceRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.resourceRequest`;
    try {
      const user = req.user;

      const businessId = req.params.businessId;
      this.httpService.requestValidation.validateUuid(businessId, "businessId", block);

      const businessResource = await this.httpService.requestValidation.validateResource<BusinessData>(businessId, "BusinessesService", "Business not found", block);
      
      await this.verifyPermissions(user.user_id, businessId, ["OWNER", "ADMIN"]);

      res.status(200).json({ data: businessResource })
    } catch (error) {
      throw error;
    }
  }

  async updateRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.updateRequest`;
    try { 
      const user = req.user;
      
      const businessId = req.params.businessId;
      this.httpService.requestValidation.validateUuid(businessId, "businessId", block);

      await this.httpService.requestValidation.validateResource<BusinessData>(businessId, "BusinessesService", "Business not found", block);
      await this.verifyPermissions(user.user_id, businessId, ["OWNER"])

      const allowedChanges = [
        "businessLogo",
        "businessName",
        "legalName",
        "businessEmail",
        "businessPhone",
        "brandedDomain",
        "businessWebsite",
        "businessNiche",
        "platformLanguage",
        "communicationLanguage",
      ];

      const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<BusinessData>(allowedChanges, req.body, block);

      await this.businessesService.update(businessId, filteredChanges);

      res.status(200).json({ message: "Business updated" });
    } catch (error) {
      throw error;
    }
  }

  async deleteRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.deleteRequest`;
    try {
      const user = req.user;

      const businessId = req.params.businessId;
      this.httpService.requestValidation.validateUuid(businessId, "businessId", block);

      await this.httpService.requestValidation.validateResource<BusinessData>(businessId, "BusinessesService", "Business not found", block);

      await this.verifyPermissions(user.userId, businessId, ["OWNER"]);

      await this.businessesService.delete(businessId)

    } catch (error) {
      throw error;
    }
  }

  private async verifyPermissions(userId: string, businessId: string, allowedRoles: string[]): Promise<void> {
    const businessUsersService = Container.resolve<BusinessUserService>("BusinessUsersService");
    const businessUser = await businessUsersService.resource(userId, businessId);

    if(!businessUser || !allowedRoles.includes(businessUser.accountType)) {
      throw new AuthorizationError();
      }
  }
}
