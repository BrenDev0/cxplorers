import { IRepository } from "../../../core/repository/repository.interface";

export interface EventAttendee {
  event_id: string;
  contact_id: string;
  status: string;
}

export interface EventAttendeeData {
  eventId: string;
  contactId: string;
  status: string;
}

export interface GoogleAttendee {
  eventId: string;
  email: string;
  status: string;
  source?: string;
  userId?: string
}

export interface IEventAttendeesRepository<EventAttendee> extends IRepository<EventAttendee> {
  upsert(cols: string[], values: any[]): Promise<EventAttendee[]>;
  deleteOne(contactId: string, eventId: string): Promise<EventAttendee>
}
