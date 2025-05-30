import { BadRequestError, InvalidIdError } from "../errors/errors";

export default class HttpRequestValidationService {
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

        validateRequestBody(requiredFields: string[], requestBody: Record<string, any>, block: string): void {
            const missingFields = requiredFields.filter((field) => !(field in requestBody));
            if(missingFields.length !== 0) {
                throw new BadRequestError("All fields required", {
                    block: block,
                    missingFields: missingFields.join(", ")
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
}