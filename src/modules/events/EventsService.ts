import { Event, EventData, GoogleEvent } from './events.interface'
import BaseRepository from "../../core/repository/BaseRepository";
import { handleServiceError } from '../../core/errors/error.service';
import Container from '../../core/dependencies/Container';
import EncryptionService from '../../core/services/EncryptionService';
import EventsRepository from './EventsRepository';

export default class EventsService {
    private repository: EventsRepository;
    private block = "events.service"
    constructor(repository: EventsRepository) {
        this.repository = repository
    }

    async create(event: GoogleEvent): Promise<Event> {
        const mappedEvent = this.mapToDb(event);
        try {
            return this.repository.create(mappedEvent);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedEvent)
            throw error;
        }
    }

    async upsert(events: GoogleEvent[]): Promise<Event[] | Event> {
        
        const mappedEvents = events.map((event) =>  this.mapToDb(event));
        const cols = Object.keys(mappedEvents[0]);
        const values: (string | number | null)[] = mappedEvents.flatMap(event => cols.map(col => (event as any)[col] ?? null));
        try {
            const result = await this.repository.upsertMany(cols, values);

            return result;
        } catch (error) {
            console.log(error);
            handleServiceError(error as Error, this.block, "resource", {
                cols,
                values
            })
            throw error;
        }
    }

    async resource(eventId: string): Promise<EventData | null> {
        try {
            const result = await this.repository.selectOne("event_id", eventId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {eventId})
            throw error;
        }
    }

    async update(eventId: string, changes: GoogleEvent): Promise<Event> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        try {
            return await this.repository.update("event_id", eventId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", cleanedChanges)
            throw error;
        }
    }

    async delete(whereCol: string, identifier: string): Promise<Event> {
        try {
            return await this.repository.delete(whereCol, identifier) as Event;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {whereCol, identifier})
            throw error;
        }
    }

    async deleteNonExistingEvents(existingReferenceIds: string[]): Promise<Event[]> {
        try {
            const result = await this.repository.deleteMany(existingReferenceIds);

            return result;
        } catch (error) {
            handleServiceError(error as Error, this.block, "deleteAbsentEvents", {existingReferenceIds})
            throw error;
        }
    }

    mapToDb(event: GoogleEvent): Event {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            event_reference_id: event.id,
            calendar_id: event.calendarId,
            created_at: event.created,
            updated_at: event.updated,
            summary: event.summary,
            description: event.description,
            start_time: event.start.dateTime,
            start_timezone: event.start.timeZone,
            end_time: event.end.dateTime,
            end_timezone: event.end.timeZone,
            status: event.status
        }
    }

    mapFromDb(event: Event): EventData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            eventId: event.event_id,
            eventReferenceId: encryptionService.encryptData(event.event_reference_id),
            calendarId: event.calendar_id,
            createdAt: event.created_at,
            updatedAt: event.updated_at,
            summary: event.summary,
            description: event.description,
            start: event.start_time,
            startTimezone: event.start_timezone,
            end: event.end_time,
            endTimezone: event.end_timezone,
            status: event.status
        }
    }
}
