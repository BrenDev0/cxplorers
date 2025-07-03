import { Request, Response } from "express";
import HttpService from "../../core/services/HttpService"
import { BadRequestError, NotFoundError } from "../../core/errors/errors";
import PermissionsService from "./PermissionsService";
import { PermissionData } from "./permissions.interface";

export default class PermissionsController { 
  private httpService: HttpService;
  private permissionsService: PermissionsService;  
  private block = "permissions.controller"; 
  

  constructor(httpService: HttpService, permissionsService: PermissionsService) {
    this.httpService = httpService;
    this.permissionsService = permissionsService;
  }

  // async createRequest(req: Request, res: Response): Promise<void> {
  //   const block = `${this.block}.createRequest`;
  //   try {
  //     const userId = req.user;

  //     const requiredfields = ["permissions"];
  //     this.httpService.requestValidation.validateRequestBody(requiredfields, req.body, block);

  //     const { permissions } = req.body;

  //     if(!Array.isArray(permissions)) {
  //       throw new BadRequestError("Permissions must be of type array");
  //     }

  //     const permissionsData = []      
  //     const requiredPermissionsFields = ["userId", "businessId", "moduleName", "action"];

  //     for(const permission of permissions) {
  //       this.httpService.requestValidation.validateRequestBody(requiredPermissionsFields, permission, block);
  //       permissionsData.push(permission)
  //     }


  //     await this.permissionsService.upsert(permissionsData);

  //     res.status(200).json({ message: "permissions added." });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // // async resourceRequest(req: Request, res: Response): Promise<void> {
  // //   const block = `${this.block}.resourceRequest`;
  // //   try {
      
  // //   } catch (error) {
  // //     throw error;
  // //   }
  // // }

  // async collectionRequest(req: Request, res: Response): Promise<void> {
  //   const block = `${this.block}.collectionRequest`;
  //   try {
  //     const user = req.user;
  //     const staffResourceId = req.params.userId;

  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async updateRequest(req: Request, res: Response): Promise<void> {
  //   const block = `${this.block}.updateRequest`;
  //   try { 
  //    const resource = await this.permissionsService.resource(user.user_id);
  //     if (!resource) {
  //       throw new NotFoundError(undefined, {
  //         block: `${block}.notFound`,
  //       });
  //     }
  //     const allowedChanges = [""];

  //     const filteredChanges = this.htttpService.requestValidation.filterUpdateRequest<PermissionsData>(allowedChanges, req.body, block);

  //     await this.permissionsService.update(filteredChanges);

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
