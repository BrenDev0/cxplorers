import { createClient, RedisClientType } from 'redis';

export default class RedisService {
    private connectionUrl: string;
    constructor(connectionUrl: string) {
        this.connectionUrl = connectionUrl
    }
    
    async createClient(): Promise<RedisClientType> {
        const redisClient: RedisClientType = createClient({
            url: this.connectionUrl,
        });
    
        redisClient.on('end', () => {
            console.log('Disconnected from Redis');
        });

        redisClient.on('connect', () => console.log('Connected to redis'));
        await redisClient.connect().catch(console.error);
        return redisClient;
    }
}