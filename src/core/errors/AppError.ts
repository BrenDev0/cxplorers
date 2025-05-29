export default class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly context?: Record<string, unknown>;

    constructor(message: string, statusCode = 500, isOperational: boolean, context?: Record<string, unknown>) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.context = context;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}