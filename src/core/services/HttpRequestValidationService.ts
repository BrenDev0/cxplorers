import Container from "../dependencies/Container";
import { AuthorizationError, BadRequestError, InvalidIdError, NotFoundError } from "../errors/errors";
import { isUUID } from "validator";

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

    validateUuid(id: string, idType: string, block: string): void {
        if(!isUUID(id)){
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

    async validateResource<T>(
        resourceId: string,
        serviceKey: string,
        notFoundMessage = "Resource not found",
        block: string
    ): Promise<T> {
         const service = Container.resolve<any>(serviceKey) as {
            resource: (id: string) => Promise<T | null>;
        };
        const resource = await service.resource(resourceId)

        if (!resource) {
            throw new NotFoundError(notFoundMessage, {
                block
            });
        }

        return resource as T
    }

    validateActionAuthorization(id: string, resourceId: string, block: string) {
        if(id !== resourceId) {
        throw new AuthorizationError(undefined, {
            block
        })
      }
    }

}