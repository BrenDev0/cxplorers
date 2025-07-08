import { Request, Response } from "express";
import HttpService from "../../core/services/HttpService"
import { AuthorizationError, BadRequestError, NotFoundError } from "../../core/errors/errors";
import BusinessesService from "./BusinessesService";
import { Business, BusinessData } from "./businesses.interface";
import Container from "../../core/dependencies/Container";
import BusinessUserService from "./businessUsers/BusinessUsersService";
import { BusinessUser, BusinessUserData } from "./businessUsers/businessUsers.interface";
import BusinessUsersService from "./businessUsers/BusinessUsersService";

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

      const businessUserData: Omit<BusinessUserData, "businessUserId"> =  {
        userId: user.user_id,
        businessId: newBusiness.business_id,
        role: "owner"
      }
      await businessUsersService.create(businessUserData);

      const token = this.httpService.webtokenService.generateToken({
        userId: user.user_id,
        businessId: newBusiness.business_id
      }, "7d")

      res.status(200).json({ message: "Business added.", token });
    } catch (error) {
      throw error;
    }
  }

  async resourceRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.resourceRequest`;
    try {
      const user = req.user;

      const businessId = req.businessId;
      this.httpService.requestValidation.validateUuid(businessId, "businessId", block);

      const businessResource = await this.httpService.requestValidation.validateResource<BusinessData>(businessId, "BusinessesService", "Business not found", block);

      res.status(200).json({ data: businessResource })
    } catch (error) {
      throw error;
    }
  }

  async collectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      const businessUsersService = Container.resolve<BusinessUserService>("BusinessUsersService");
      const usersBusinesses = await businessUsersService.ownersCollection(user.user_id);
      if(usersBusinesses.length === 0) {
        res.status(200).json({ data: []});
        return;
      }

      const ids = usersBusinesses.map((business) => business.businessId);
      const data = await this.businessesService.collection(ids);

      res.status(200).json({ data: data })
    } catch (error) {
      throw error
    }
  }

  async updateRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.updateRequest`;
    try { 
      const user = req.user;
      
      const businessId = req.businessId;
      this.httpService.requestValidation.validateUuid(businessId, "businessId", block);

      await this.httpService.requestValidation.validateResource<BusinessData>(businessId, "BusinessesService", "Business not found", block);

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
      const businessId = req.businessId;
      this.httpService.requestValidation.validateUuid(businessId, "businessId", block);

      await this.httpService.requestValidation.validateResource<BusinessData>(businessId, "BusinessesService", "Business not found", block);

      await this.businessesService.delete(businessId);

      const businessUsersService = Container.resolve<BusinessUsersService>("BusinessUsersService");
      const businesses = await businessUsersService.collection("user_id", user.user_id);

      const tokenPayload: any = {
        userId: user.user_id
      }

      if(businesses.length !== 0) {
        tokenPayload.businessId = businesses[0].businessId
      }

      const token = this.httpService.webtokenService.generateToken(tokenPayload, "7d");

      res.status(200).json({ message: "Business deleted", token })

    } catch (error) {
      throw error;
    }
  }

  async businessLogin(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const businessId = req.params.businessId;

      const businessUsersService = Container.resolve<BusinessUsersService>("BusinessUsersService");

      const businessUser = await businessUsersService.selectByIds(user.user_id, businessId);
      if(!businessUser) {
        throw new AuthorizationError();
      }

      const token = this.httpService.webtokenService.generateToken({
        userId: user.user_id,
        businessId: businessId
      }, "7d")

      res.status(200).json({ token })
    } catch (error) {
      throw error;
    }
  }
}
