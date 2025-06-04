import { Calendar, CalendarData } from './calendars.interface'
import BaseRepository from "../../core/repository/BaseRepository";
import { handleServiceError } from '../../core/errors/error.service';
import Container from '../../core/dependencies/Container';
import EncryptionService from '../../core/services/EncryptionService';

export default class CalendarsService {
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
            calendar_reference_id: calendar.calendarReferenceId && encryptionService.encryptData(calendar.calendarReferenceId),
            title: calendar.title,
            description: calendar.description,
            background_color: calendar.backgroundColor,
            foreground_color: calendar.foregroundColor,
            watch_channel: calendar.watchChannel === null
            ? null
            : encryptionService.encryptData(calendar.watchChannel),
            watch_channel_resource_id: calendar.watchChannelResourceId === null
            ? null
            : encryptionService.encryptData(calendar.watchChannelResourceId),
            channel_expiration_ms: calendar.channelExpirationMs
        }
    }

    mapFromDb(calendar: Calendar): CalendarData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            calendarId: calendar.calendar_id,
            userId: calendar.user_id,
            calendarReferenceId: encryptionService.decryptData(calendar.calendar_reference_id),
            title: calendar.title,
            description: calendar.description ,
            backgroundColor: calendar.background_color,
            foregroundColor: calendar.foreground_color,
            watchChannel: calendar.watch_channel && encryptionService.decryptData(calendar.watch_channel),
            watchChannelResourceId: calendar.watch_channel_resource_id && encryptionService.decryptData(calendar.watch_channel_resource_id),
            channelExpirationMs: calendar.channel_expiration_ms
        }
    }
}
