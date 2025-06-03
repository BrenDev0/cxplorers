import { Calendar, CalendarData } from './calendars.interface'
import BaseRepository from "../../core/repository/BaseRepository";
import { handleServiceError } from '../../core/errors/error.service';
import Container from '../../core/dependencies/Container';
import EncryptionService from '../../core/services/EncryptionService';

export default class CalendarService {
    private repository: BaseRepository<Calendar>;
    private block = "calendars.service"
    constructor(repository: BaseRepository<Calendar>) {
        this.repository = repository
    }

    async create(calendar: CalendarData): Promise<Calendar> {
        const mappedCalendar = this.mapToDb(calendar);
        try {
            return this.repository.create(mappedCalendar);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedCalendar)
            throw error;
        }
    }

    async resource(calendarId: string): Promise<CalendarData | null> {
        try {
            const result = await this.repository.selectOne("calendar_id", calendarId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {calendarId})
            throw error;
        }
    }

    async collection(userId: string): Promise<CalendarData[]> {
        try {
            const result = await this.repository.select("user_id", userId);
            const data = result.map((calendar: Calendar) => this.mapFromDb(calendar));

            return data;
        } catch (error) {
            console.log(error, "ERROR:::::::::::::::")
            handleServiceError(error as Error, this.block, "collection", {userId})
            throw error;
        }
    }

    async update(calendarId: string, changes: CalendarData): Promise<Calendar> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        try {
            return await this.repository.update("calendar_id", calendarId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", cleanedChanges)
            throw error;
        }
    }

    async delete(calendarId: string): Promise<Calendar> {
        try {
            return await this.repository.delete("calendar_id", calendarId) as Calendar;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {calendarId})
            throw error;
        }
    }

    mapToDb(calendar: CalendarData): Calendar {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            user_id: calendar.userId,
            reference_id: calendar.referenceId && encryptionService.encryptData(calendar.referenceId),
            title: calendar.title,
            description: calendar.description || null,
            background_color: calendar.backgroundColor || null,
            foreground_color: calendar.foregroundColor || null
        }
    }

    mapFromDb(calendar: Calendar): CalendarData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            userId: calendar.user_id,
            referenceId: encryptionService.decryptData(calendar.reference_id),
            title: calendar.title,
            description: calendar.description ,
            backgroundColor: calendar.background_color,
            foregroundColor: calendar.foreground_color 
        }
    }
}
