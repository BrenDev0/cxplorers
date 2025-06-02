import { User, UserData, UserGoogleData } from './users.interface'
import BaseRepository from "../../core/repository/BaseRepository";
import { handleServiceError } from '../../core/errors/error.service';
import Container from '../../core/dependencies/Container';
import EncryptionService from '../../core/services/EncryptionService';
import UsersRepository from './UsersRepository';

export default class UsersService {
    private repository: UsersRepository;
    private block = "users.service"
    constructor(repository: UsersRepository) {
        this.repository = repository
    }

    async create(user: UserData): Promise<User> {
        const mappedUser = this.mapToDb(user);
        try {
            // from parent class ../../core/repository/BaseRepository
            return this.repository.create(mappedUser);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedUser)
            throw error;
        }
    }

    // do not map user for internal use, handle mapping in controller for frontend use
    async resource(whereCol: string, identifier: string): Promise<User | null> {
        try {
            // from parent class ../../core/repository/BaseRepository
            const result = await this.repository.selectOne(whereCol, identifier);
            if(!result) {
                return null
            }
            return result
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {whereCol, identifier})
            throw error;
        }
    }

    async getUsersGoogleData(userId: string): Promise<UserGoogleData> {
        try {
            const result = await this.repository.getGoogleData(userId);
            return result
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", {userId})
            throw error;
        }
    }

    async update(userId: string, changes: UserData): Promise<User> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        try {
            // from parent class ../../core/repository/BaseRepository
            return await this.repository.update("user_id", userId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", cleanedChanges)
            throw error;
        }
    }

    async delete(userId: string): Promise<User> {
        try {
            // from parent class ../../core/repository/BaseRepository
            return await this.repository.delete("user_id", userId) as User;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {userId})
            throw error;
        }
    }

    mapToDb(user: UserData): User {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
           email: user.email && encryptionService.encryptData(user.email),
           name: user.name &&  encryptionService.encryptData(user.name),
           phone: user.phone && encryptionService.encryptData(user.phone),
           password: user.password
        }
    }

    mapFromDb(user: User): Omit<UserData, "password">{
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            userId: user.user_id,
            email: encryptionService.decryptData(user.email),
            name: encryptionService.decryptData(user.name),
            phone: encryptionService.decryptData(user.phone),
            createdAt: user.created_at
        }
    }
}
