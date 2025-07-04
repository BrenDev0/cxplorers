import { Request, Response } from "express";
import HttpService from "../../core/services/HttpService"
import { AuthorizationError, BadRequestError, NotFoundError } from "../../core/errors/errors";
import ContactsService from "./ContactsService";
import { ContactData } from "./contacts.interface";
import Container from "../../core/dependencies/Container";
import BusinessUsersService from "../businesses/businessUsers/BusienssUsersService";

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
      const requiredFields = ["firstName", "businessId"];

      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

      await this.contactsService.create(req.body);

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

      const resource = await this.httpService.requestValidation.validateResource<ContactData>(contactId, "ContactsService", "Contact not found", block);
      
      const businessUsersService = Container.resolve<BusinessUsersService>("BusinessUsersService");
      const businesses = await businessUsersService.collection("user_id", user.user_id)
      const ids = businesses.map((business) => business.businessId);

      if(!ids.includes(resource.businessId)) {
        throw new AuthorizationError();
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

      const resource = await this.httpService.requestValidation.validateResource<ContactData>(contactId, "ContactsService", "Contact not found", block);
     

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
      
      const resource = await this.httpService.requestValidation.validateResource<ContactData>(contactId, "ContactsService", "Contact not found", block);

      await this.contactsService.delete(contactId);
      
      res.status(200).json({ message: "Contact deleted"})
    } catch (error) {
      throw error;
    }
  }
}
