import { Request, Response } from "express";
import HttpService from "../../../core/services/HttpService"
import { BadRequestError, NotFoundError } from "../../../core/errors/errors";
import TaggingsService from "./TaggingsService";
import { TaggingData } from "./taggings.interface";
import { Tag, TagData } from "../tags.interface";
import { ContactData } from "../../contacts/contacts.interface";
import { builtinModules } from "module";

export default class TaggingsController { 
  private httpService: HttpService;
  private taggingsService: TaggingsService;  
  private block = "taggings.controller"; 
  

  constructor(httpService: HttpService, taggingsService: TaggingsService) {
    this.httpService = httpService;
    this.taggingsService = taggingsService;
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.createRequest`;
    try {
      const user = req.user; 
      const businessId = req.businessId;
      
      const requiredFields = ["tagId", "contactId"];
      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

      const { tagId, contactId } = req.body;

      const [tagResource, contactResource] = await Promise.all([
        this.httpService.requestValidation.validateResource<TagData>(tagId, "TagsService", "Tag not found", block),
        this.httpService.requestValidation.validateResource<ContactData>(contactId, "ContactsService", "Contact not found", block)
      ]);

      this.httpService.requestValidation.validateActionAuthorization(businessId, tagResource.businessId, block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, contactResource.businessId, block);

      const taggingExists = await this.taggingsService.resource(tagId, contactId);
      if(taggingExists) {
        throw new BadRequestError("Contact already has requested tag")
      }

      await this.taggingsService.create(req.body);

      res.status(200).json({ message: "Tagging added" });
    } catch (error) {
      throw error;
    }
  }

  async collectionRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.collectionRequest`
    try {
      const user = req.user;
      const businessId = req.businessId;

      const allowedFilters = ["contact", "tag"];

      const query = req.query.filter as string; 
      const identifier = req.query.identifier as string;

      if(!query || !identifier) {
        throw new BadRequestError("Invalid query");
      }

      if(!allowedFilters.includes(query)) {
        throw new BadRequestError("Invalid query");
      }

      this.httpService.requestValidation.validateUuid(identifier, "unknown", block)

      let filter;

      if(query === "contact") {
        const contactResource = await this.httpService.requestValidation.validateResource<ContactData>(identifier, "ContactsService", "Contact no found", block);
        this.httpService.requestValidation.validateActionAuthorization(businessId, contactResource.businessId, block);

        filter = "contact_id";
      } else {
        const tagResource = await this.httpService.requestValidation.validateResource<TagData>(identifier, "TagsService", "Tag not found", block);
        this.httpService.requestValidation.validateActionAuthorization(businessId, tagResource.businessId, block);

        filter = "tag_id";
      }

      const data = await this.taggingsService.collection(filter, identifier);

      res.status(200).json({ data });
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

  async deleteRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.deleteRequest`;
    try {
     const user = req.user; 
      const businessId = req.businessId;
      
      const requiredFields = ["tagId", "contactId"];
      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

      const { tagId, contactId } = req.body;

      const [tagResource, contactResource] = await Promise.all([
        this.httpService.requestValidation.validateResource<TagData>(tagId, "TagsService", "Tag not found", block),
        this.httpService.requestValidation.validateResource<ContactData>(contactId, "ContactsService", "Contact not found", block)
      ]);

      this.httpService.requestValidation.validateActionAuthorization(businessId, tagResource.businessId, block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, contactResource.businessId, block);

      const taggingExists = await this.taggingsService.resource(tagId, contactId);
      if(!taggingExists) {
        throw new BadRequestError("Tagging not found")
      }

      await this.taggingsService.delete(tagId, contactId);

      res.status(200).json({ message: "Tagging deleted"  })
    } catch (error) {
      throw error;
    }
  }
}
