import { Contact, ContactData } from './contacts.interface'
import BaseRepository from "../../core/repository/BaseRepository";
import { handleServiceError } from '../../core/errors/error.service';
import Container from '../../core/dependencies/Container';
import EncryptionService from '../../core/services/EncryptionService';
import ContactsRepository from './ContactsRepository';

export default class ContactService {
    private repository: ContactsRepository;
    private block = "contacts.service"
    constructor(repository: ContactsRepository) {
        this.repository = repository
    }

    async create(contact: ContactData): Promise<Contact> {
        const mappedContact = this.mapToDb(contact);
        try {
            return this.repository.create(mappedContact);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedContact)
            throw error;
        }
    }

    async upsert<T>(contacts: T[], conflicCol: string): Promise<Contact[]> {
            
        const mappedContacts = contacts.map((contact) =>  this.mapToDb(contact as ContactData));
        const cols = Object.keys(mappedContacts[0]);
        const values: (string | number | null)[] = mappedContacts.flatMap(contact => cols.map(col => (contact as any)[col] ?? null));
        try {
            const result = await this.repository.upsert(cols, values, conflicCol);
          
            return result;
        } catch (error) {
            console.log(error);
            handleServiceError(error as Error, this.block, "upsert", {
                cols,
                values,
                conflicCol
            })
            throw error;
        }
    }

    async resource(contactId: string): Promise<ContactData | null> {
        try {
            const result = await this.repository.selectOne("contact_id", contactId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {contactId})
            throw error;
        }
    }

    async collection(userId: string): Promise<ContactData[]> {
        try {
            const result = await this.repository.select("user_id", userId);
           
            const data = result.map((contact: Contact) => this.mapFromDb(contact));

            return data;
        } catch (error) {
            handleServiceError(error as Error, this.block, "collection", {userId})
            throw error;
        }
    }

    async update(contactId: string, changes: ContactData): Promise<Contact> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        try {
            return await this.repository.update("contact_id", contactId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", cleanedChanges)
            throw error;
        }
    }

    async delete(contactId: string): Promise<Contact> {
        try {
            return await this.repository.delete("contact_id", contactId) as Contact;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {contactId})
            throw error;
        }
    }

    mapToDb(contact: ContactData): Contact {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            user_id: contact.userId,
            first_name: contact.firstName && encryptionService.encryptData(contact.firstName),
            last_name: contact.lastName && encryptionService.encryptData(contact.lastName),
            email: contact.email && encryptionService.encryptData(contact.email),
            phone: contact.phone && encryptionService.encryptData(contact.phone),
            source: contact.source
        }
    }

    mapFromDb(contact: Contact): ContactData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            contactId: contact.contact_id,
            userId: contact.user_id,
            firstName: contact.first_name && encryptionService.decryptData(contact.first_name),
            lastName: contact.last_name && encryptionService.decryptData(contact.last_name),
            email: contact.email && encryptionService.decryptData(contact.email),
            phone: contact.phone && encryptionService.decryptData(contact.phone),
            source: contact.source
        }
    }
}
