import { Pool } from  'pg'

class Database {
    pool: Pool | null
    isconnected: boolean;
    private initPromise: null | Promise<void>;
    private static instance: Database;

    private constructor() {
        this.pool = null
        this.isconnected = false;
        this.initPromise = null;
    }

    public static getInstance(): Database {
        if (!Database.instance) {
          Database.instance = new Database();
        }
        return Database.instance;
    }

    // default 10sec 
    private async withTimeout<T>(promise: Promise<T>, timeout = 10000): Promise<T> {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Operation timed out')), timeout)
          ),
        ]);
      }

    private async init() {
        if (this.initPromise !== null) {
            return this.initPromise;
        }

        console.log('Initializing Database...');
        
        this.initPromise = (async() => {
            try {
                this.pool = new Pool({
                    host: process.env.PGHOST,
                    user: process.env.PGUSER,
                    password: process.env.PGPASSWORD,
                    database: process.env.PGDATABASE,
                    port: 5432,
                    ssl: {
                        rejectUnauthorized: false,
                    }
                })

                await this.withTimeout(this.pool.query('SELECT 1'));
                this.isconnected = true;
                console.log("Database Connected.")
                return;
            } catch (error) {
                console.error('Error initializing the app:', error);
                this.isconnected = false;
                this.initPromise = null;
                throw error;
            }
        })();

        return this.initPromise;
    }

    async getPool() {
        try {
            if(!this.isconnected || this.pool === null) {
                if(this.initPromise === null) {
                    console.log('Reconnecting to the database...')
                };
                await this.init()
            }
    
            return this.pool as Pool;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

const databaseInstance = Database.getInstance();
export default databaseInstance;