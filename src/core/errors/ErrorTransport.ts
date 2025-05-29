import { Pool } from 'pg';
import Transport from 'winston-transport'

interface ErrorTransportOptions {
  level?: string;
  pool: Pool;
  tableName: string;
  serviceName: string;
}

interface ErrorLog {
  level: string;
  name?: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  isOperational?: boolean;
}

export default class ErrorTransport extends Transport {
  private pool: Pool;
  private tableName: string;
  private serviceName: string;

  constructor(options: ErrorTransportOptions) {
    super({ level: options.level });
    this.pool = options.pool;
    this.tableName = options.tableName 
    this.serviceName = options.serviceName
  }

  async log(info: ErrorLog, callback: () => void): Promise<void> {
    try {
     const reults = await this.pool.query(
        `INSERT INTO ${this.tableName} 
        (level, error_name, message, stack, context, is_operational, service_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          info.level,
          info.name,
          info.message,
          info.stack,
          info.context ? JSON.stringify(info.context) : null,
          info.isOperational || false,
          this.serviceName
        ]
      );

      console.log(reults.rows)
    } catch (error) {
      console.error('Failed to write log to db:', error);
    }
    setImmediate(callback);
  }
}