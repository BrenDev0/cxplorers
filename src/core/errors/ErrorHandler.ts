// error-handler.ts
import winston, { Logger } from 'winston';
import AppError from './AppError';
import { Pool } from 'pg';
import ErrorTransport from './ErrorTransport';

export default class ErrorHandler {
  private logger: Logger;
  private pool: Pool;

  constructor(pool: Pool, logger?: Logger) {
    this.pool = pool;
    this.logger = logger ?? this.createDefaultLogger();
  }

  private createDefaultLogger(): Logger {
    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
        ),
        transports: [
            new ErrorTransport({
                pool: this.pool,
                level: 'error',
                tableName: 'error_logs',
                serviceName: "platform"
            }),
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format(info => {
                  delete info.stack; // Strip stack trace
                  return info;
                })(),
                winston.format.simple()
              )
            })
        ]
    });

    return logger;
  }

  public async handleError(error: unknown): Promise<void> {
    try {
      if (error instanceof AppError) {
        await this.handleAppError(error);
      } else if (error instanceof Error) {
        await this.handleGenericError(error);
      } else {
        await this.handleUnknownError(error);
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  private async handleAppError(error: AppError): Promise<void> {
    const logData = {
      level: error.isOperational ? 'warn' : 'error',
      name: error.name,
      message: error.message,
      stack: error.stack,
      context: error.context,
      isOperational: error.isOperational,
    };

    this.logger.log(logData);
  }

  private async handleGenericError(error: Error): Promise<void> {
    this.logger.error({
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }

  private async handleUnknownError(error: unknown): Promise<void> {
    this.logger.error({
      error: String(error),
    });
  }

  public isTrustedError(error: unknown): boolean {
    return error instanceof AppError && error.isOperational;
  }

  public async queryLogs(options: {
    since?: Date;
    level?: string;
    limit?: number;
  }): Promise<any[]> {
    const query = {
      text: `SELECT * FROM error_logs 
             WHERE ($1::timestamptz IS NULL OR timestamp >= $1)
             AND ($2::text IS NULL OR level = $2)
             ORDER BY timestamp DESC
             LIMIT $3`,
      values: [options.since, options.level, options.limit || 100]
    };
    
    const result = await this.pool.query(query);
    return result.rows;
  }
}
