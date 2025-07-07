import { IRepository } from "../../core/repository/repository.interface";

export interface Contact {
  contact_id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: string;
  created_at: string;
}

export interface ContactData {
  contactId: string;
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  createdAt: string;
}

export interface IContactsRepository<Contact> extends IRepository<Contact>{
  upsert(cols: string[], values: any[], conflict: string): Promise<Contact[]>;
}