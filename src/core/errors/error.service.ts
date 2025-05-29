import { DatabaseError } from "./errors";
//  generic error for sercices //
export function handleServiceError(error: Error, service: string, method: string, params: any): void {
    throw new DatabaseError(undefined, {
        originalError: error.message,
        service: service,
        method: method,
        params: params
    })
}