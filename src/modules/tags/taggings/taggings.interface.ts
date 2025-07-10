import { IRepository } from "../../../core/repository/repository.interface";

export interface Tagging {
  tag_id: string;
  contact_id: string
}

export interface TaggingData {
  tagId: string;
  contactId: string;
}

export interface ITaggingsRepository extends IRepository<Tagging> {
  resource(tagId: string, resourceId: string): Promise<Tagging | null>;
  deleteByIds(tagId: string, resourceId: string): Promise<Tagging>;
  collection(businessId: string, filterKey: string, filterValue: string): Promise<Tagging[]>;
}
