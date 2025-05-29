import AppError from "../../core/errors/AppError";

export class GoogleError extends AppError {
  constructor(message = "No pudimos leer correctamente tus archivos. Te recomendamos revisar la configuración de tu cuenta de Google en el panel de usuario.", context?: Record<string, unknown>) {
    super(message, 400, true, context);
    this.name = 'InvalidIdError';
  }
}