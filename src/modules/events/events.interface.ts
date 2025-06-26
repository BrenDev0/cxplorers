import { IRepository } from "../../core/repository/repository.interface";

export interface Event {
  event_id:string;
  event_reference_id: string;
  calendar_id: string;
  created_at: Date;
  updated_at: Date;
  summary: string;
  description: string | null;
  start_time: Date;
  start_timezone: string;
  end_time: Date;
  end_timezone: string;
  status: string;
  calendar_reference_id?: string;
}

export interface EventData {
  eventId:string;
  eventReferenceId: string;
  calendarId: string;
  createdAt: Date;
  updatedAt: Date;
  summary: string;
  description: string | null;
  start: Date;
  startTimezone: string;
  end: Date;
  endTimezone: string;
  status: string;
   calendarReferenceId?: string;
}

export interface GoogleEvent {
  calendarId: string;
  kind: string;
  etag: string;
  id: string;
  status: string;
  htmlLink: string;
  created: Date;
  updated: Date;
  summary: string;
  creator: { 
    email: string;
  }
  organizer: {
    email: string;
    displayName: string;
    self: true
  }
  start: {
    dateTime: Date,
    timeZone: string; 
  }
  end: {
    dateTime: Date,
    timeZone: string;       
  }
  iCalUID: string;
  sequence: number;
  reminders: { 
    useDefault: boolean 
  }
  eventType: string;
  description: string;
  attendees: Record<string, string>[]
}

export interface IEventsRepository<Event> extends IRepository<Event> {
  resource(eventId: string): Promise<Event | null>
  upsert(cols: string[], values: any[]): Promise<Event[]>;
  deleteMany(eventReferenceIds: string[]): Promise<Event[]>;
}
