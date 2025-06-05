import AppError from "../../core/errors/AppError";

export class GoogleError extends AppError {
  constructor(message = "Google API error", context?: Record<string, unknown>) {
    super(message, 400, true, context);
    this.name = 'InvalidIdError';
  }
}