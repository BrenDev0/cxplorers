import { EventAttendee, EventAttendeeData, GoogleAttendee } from './eventAttendees.interface'
import BaseRepository from "../../core/repository/BaseRepository";
import { handleServiceError } from '../../core/errors/error.service';
import Container from '../../core/dependencies/Container';
import EncryptionService from '../../core/services/EncryptionService';
import EventAttendeesRepositoy from './EventAttendeesRepository';
import ContactService from '../contacts/ContactsService';

export default class EventAttendeesService {
    private repository: EventAttendeesRepositoy;
    private block = "eventAtendees.service"
    constructor(repository: EventAttendeesRepositoy) {
        this.repository = repository
    }

    async create(eventAttendee: EventAttendeeData): Promise<EventAttendee> {
        const mappedEventAttendee = this.mapToDb(eventAttendee);
        try {
            return this.repository.create(mappedEventAttendee);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedEventAttendee)
            throw error;
        }
    }

    async upsert(eventAttendees: EventAttendeeData[]): Promise<EventAttendee[]> {
            
            const mappedEventAttendees = eventAttendees.map((eventAttendee) =>  this.mapToDb(eventAttendee));
            const cols = Object.keys(mappedEventAttendees [0]);
            const values: (string | number | null)[] = mappedEventAttendees .flatMap(eventAttendee => cols.map(col => (eventAttendee as any)[col] ?? null));
            try {
                const result = await this.repository.upsert(cols, values);
    
                return result;
            } catch (error) {
                console.log(error);
                handleServiceError(error as Error, this.block, "upsert", {
                    cols,
                    values
                })
                throw error;
            }
        }

    async resource(whereCol: string, identifier: string): Promise<EventAttendeeData | null> {
        try {
            const result = await this.repository.selectOne(whereCol, identifier);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", { whereCol, identifier })
            throw error;
        }
    }

    async collection(whereCol: string, identifier: string): Promise<EventAttendeeData[]> {
        try {
            const result = await this.repository.select(whereCol, identifier);
            return result.map((attendee) => this.mapFromDb(attendee))
        } catch (error) {
            handleServiceError(error as Error, this.block, "collection", { whereCol, identifier })
            throw error;
        }
    }


    // async update(changes: EventAtendeeData): Promise<EventAtendee> {
    //     const mappedChanges = this.mapToDb(changes);
    //     const cleanedChanges = Object.fromEntries(
    //         Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
    //     );
    //     try {
    //         return await this.repository.update();
    //     } catch (error) {
    //         handleServiceError(error as Error, this.block, "update", cleanedChanges)
    //         throw error;
    //     }
    // }

    // async delete(whereCol: string, identifier: string): Promise<EventAtendee> {
    //     try {
    //         return await this.repository.delete(whereCol, ) as EventAtendee;
    //     } catch (error) {
    //         handleServiceError(error as Error, this.block, "delete")
    //         throw error;
    //     }
    // }

    async deleteEventAttendees(eventId: string): Promise<EventAttendee[]> {
        try {
             return await this.repository.delete("event_id", eventId) as EventAttendee[];
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", { eventId })
            throw error;
        }
    }

    async deleteOne(contactId: string, eventId: string): Promise<EventAttendee> {
        try {
            const result = await this.repository.deleteOne(contactId, eventId);

            return result;
        } catch (error) {
            handleServiceError(error as Error, this.block, "deleteOne", { eventId })
            throw error;
        }
    }

    async handleAttendees(attendees: GoogleAttendee[]): Promise<EventAttendee[]> {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        const contactsService = Container.resolve<ContactService>("ContactsService");
        try {
            const contacts = await contactsService.upsert<GoogleAttendee>(attendees, "email");

            const upsertData = attendees.map((attendee) => {
                const contactReference = contacts.find((contact) => contact.email === encryptionService.encryptData(attendee.email))
                
                return {
                    event_id: attendee.eventId,
                    contact_id: contactReference?.contact_id,
                    status: attendee.status
                }
            });

            const cols = Object.keys(upsertData[0]);
            const values: (string | number | null)[] = upsertData.flatMap(attendee => cols.map(col => (attendee as any)[col]));

            const result = await this.repository.upsert(cols, values);
            
            return result;
        } catch (error) {
            console.log(error);
            handleServiceError(error as Error, this.block, "upsert", { attendees })
            throw error;
        }
    }

    mapToDb(eventAttendee: EventAttendeeData): EventAttendee {
        return {
           event_id: eventAttendee.eventId,
           contact_id: eventAttendee.contactId,
           status: eventAttendee.status
        }
    }

    mapFromDb(eventAttendee: EventAttendee): EventAttendeeData {
        return {
            eventId: eventAttendee.event_id,
            contactId: eventAttendee.contact_id,
            status: eventAttendee.status
        }
    }
}
