import { Request, Response } from "express";
import HttpService from "../../core/services/HttpService"
import { BadRequestError, NotFoundError } from "../../core/errors/errors";
import TagsService from "./TagsService";
import { TagData } from "./tags.interface";
import { builtinModules } from "module";

export default class TagsController { 
  private httpService: HttpService;
  private tagsService: TagsService;  
  private block = "tags.controller"; 
  

  constructor(httpService: HttpService, tagsService: TagsService) {
    this.httpService = httpService;
    this.tagsService = tagsService;
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.createRequest`;
    try {
      const user = req.user;
      const businessId = req.businessId;

      const requiredFields = ["tag"];
      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

      const tagData = {
        ...req.body,  
        businessId
      };

      await this.tagsService.create(tagData);

      res.status(200).json({ message: "Tag added" });
    } catch (error) {
      throw error;
    }
  }

  async resourceRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.resourceRequest`;
    try {
      const user = req.user;
      const businessId = req.businessId;

      const tagId = req.params.tagId;
      this.httpService.requestValidation.validateUuid(tagId, "tagId", block);

      const tagResource = await this.httpService.requestValidation.validateResource<TagData>(tagId, "TagsService", "Tag not found", block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, tagResource.businessId, block);

      res.status(200).json({ data: tagResource })
    } catch (error) {
      throw error;
    }
  }

  async collectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const businessId = req.businessId;

      const data = await this.tagsService.collection(businessId);

      res.status(200).json({ data })
    } catch (error) {
      throw error;
    }
  }

  async updateRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.updateRequest`;
    try { 
      const user = req.user;
      const businessId = req.businessId;

      const tagId = req.params.tagId;
      this.httpService.requestValidation.validateUuid(tagId, "tagId", block);

      const tagResource = await this.httpService.requestValidation.validateResource<TagData>(tagId, "TagsService", "Tag not found", block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, tagResource.businessId, block);
      
      const allowedChanges = ["tag"];
      
      const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<TagData>(allowedChanges, req.body, block);

      await this.tagsService.update(tagId, filteredChanges);

      res.status(200).json({ message: "Tag updated" });
    } catch (error) {
      throw error;
    }
  }

  async deleteRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.deleteRequest`;
    try {
     const user = req.user;
      const businessId = req.businessId;

      const tagId = req.params.tagId;
      this.httpService.requestValidation.validateUuid(tagId, "tagId", block);

      const tagResource = await this.httpService.requestValidation.validateResource<TagData>(tagId, "TagsService", "Tag not found", block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, tagResource.businessId, block);

      await this.tagsService.delete(tagId);
      
      res.status(200).json({ message: "Tag deleted" })
    } catch (error) {
      throw error;
    }
  }
}
