import { Request, Response } from "express";
import HttpService from "../../core/services/HttpService"
import { AuthorizationError, BadRequestError, NotFoundError } from "../../core/errors/errors";
import ContactsService from "./ContactsService";
import { ContactData } from "./contacts.interface";

export default class ContactsController { 
  private httpService: HttpService;
  private contactsService: ContactsService;  
  private block = "contacts.controller"; 
  

  constructor(httpService: HttpService, contactsService: ContactsService) {
    this.httpService = httpService;
    this.contactsService = contactsService;
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.createRequest`;
    try {
      const user = req.user;
      const requiredFields = ["firstName"];

      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);


      const contactData = {
        ...req.body,
        userId: user.user_id
      };

      await this.contactsService.create(contactData);

      res.status(200).json({ message: "Contact added" });
    } catch (error) {
      throw error;
    }
  }

  async resourceRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.resourceRequest`;
    try {
      const user = req.user;
      const contactId = req.params.contactId;

      this.httpService.requestValidation.validateUuid(contactId, "contactId", block);
      const resource = await this.contactsService.resource(contactId);
      if(!resource) {
        throw new NotFoundError(undefined, {
          block: `${block}contactExistsCheck`,
          resource: resource || `No contact found in db with id: ${contactId}`
        });
      }

      if(resource.userId !== user.user_id) {
        throw new AuthorizationError(undefined, {
          block: `${block}.userCheck`,
          contactUserId: resource.userId,
          user: user.user_id
        })
      }

      res.status(200).json({ data: resource });
    } catch (error) {
      throw error;
    }
  }

  async collectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      const data = await this.contactsService.collection(user.user_id);
      
      res.status(200).json({ data: data });
    } catch (error) {
      throw error;
    }
  }

  async updateRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.updateRequest`;
    try { 
      const user = req.user;
      const contactId = req.params.contactId;

      this.httpService.requestValidation.validateUuid(contactId, "contactId", block);

      const resource = await this.contactsService.resource(contactId);
      if (!resource) {
        throw new NotFoundError(undefined, {
          block: `${block}.contactExistsCheck`,
          resource: resource || `No contact found in db with id: ${contactId}`
        });
      }

      if(resource.userId !== user.user_id) {
        throw new AuthorizationError(undefined, {
          block: `${block}.userCheck`,
          contactUserId: resource.userId,
          user: user.user_id
        })
      }

      const allowedChanges = ["firstName", "lastName", "email", "phone"];

      const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<ContactData>(allowedChanges, req.body, block);

      await this.contactsService.update(contactId, filteredChanges);

      res.status(200).json({ message: "Contact updated" });
    } catch (error) {
      throw error;
    }
  }

  async deleteRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.deleteRequest`;
    try {
      const user = req.user;
      const contactId = req.params.contactId;

      this.httpService.requestValidation.validateUuid(contactId, "contactId", block);
      const resource = await this.contactsService.resource(contactId);
      if(!resource) {
        throw new NotFoundError(undefined, {
          block: `${block}contactExistsCheck`,
          resource: resource || `No contact found in db with id: ${contactId}`
        });
      }

      if(resource.userId !== user.user_id) {
        throw new AuthorizationError(undefined, {
          block: `${block}.userCheck`,
          contactUserId: resource.userId,
          user: user.user_id
        })
      }

      await this.contactsService.delete(contactId);
      
      res.status(200).json({ message: "Contact deleted"})
    } catch (error) {
      throw error;
    }
  }
}
