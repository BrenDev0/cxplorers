import { BadRequestError, InvalidIdError } from "../errors/errors";
import EncryptionService from "../services/EncryptionService";
import WebTokenService from "../services/WebtokenService";
import bcrypt from 'bcrypt';

export default class Controller {
    protected webtokenService: WebTokenService;
    protected encryptionService: EncryptionService;
    protected errorMessage = "Unable to process request"
    constructor() {
        this.webtokenService = new WebTokenService();
        this.encryptionService = new EncryptionService();
    };

    validateId(id: number, idType: string, block: string): void {
        if(isNaN(id)){
            throw new InvalidIdError(undefined, {
                block: `${block}.IdValidation`,
                id: id,
                idtype: idType 
            })
        }

        return;
    }

    filterUpdateRequest<T extends Record<string, any>>(allowedChanges: string[], requestBody: Record<string, any>, block: string): T {
        const filteredBody: Partial<T> = {}
        for(const key of allowedChanges) {
            if(key in requestBody) {
                filteredBody[key as keyof T] = requestBody[key]
            }
        };

        if(Object.keys(filteredBody).length === 0) {
            throw new BadRequestError("Invalid or empty request body", {
                block: `${block}.filteredDataValidation`,
                request: requestBody,
                filteredBody: filteredBody
            })
        };
        
        return filteredBody as T;
    }

    async hashPassword(password: string): Promise<string> {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            return hashedPassword;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async comparePassword(password: string, hash: string): Promise<boolean> {
        try {
            const results = await bcrypt.compare(password, hash);
            
            return results;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}