import { IRepository } from "../../core/repository/repository.interface";

export interface Business {
  business_id: string;
  business_logo: string;
  business_name: string;
  legal_name: string;
  business_email: string;
  business_phone: string;
  branded_domain: string;
  business_website: string;
  business_niche: string;
  platform_language: string;
  communication_language: string;
}

export interface BusinessData {
  businessId: string;
  businessLogo: string;
  businessName: string;
  legalName: string;
  businessEmail: string;
  businessPhone: string;
  brandedDomain: string;
  businessWebsite: string;
  businessNiche: string;
  platformLanguage: string;
  communicationLanguage: string;
}

export interface IBusinessesRepository extends IRepository<Business> {
  collectionByIds(businessIds: string[]): Promise<Business[]>;
} 