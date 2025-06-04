import { IRepository } from "../../core/repository/repository.interface";

export interface Event {
  event_id?:string;
  event_reference_id: string;
  calendar_id: string;
  created_at: Date;
  updated_at: Date;
  title: string;
  start_time: Date;
  start_timezone: string;
  end_time: Date;
  end_timezone: string;
  status: string;
}

export interface EventData {
  eventId?:string;
  eventReferenceId: string;
  calendarId: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  startTime: Date;
  startTimezone: string;
  endTime: Date;
  endTimezone: string;
  status: string;
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
}

export interface IEventsRepository<Event> extends IRepository<Event> {
  upsertMany(cols: string[], values: any[]): Promise<Event | Event[]>
}
