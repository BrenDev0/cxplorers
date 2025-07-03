import Container from './Container'
import databaseInstance from "../database/Database";
import ErrorHandler from '../errors/ErrorHandler';
import MiddlewareService from '../middleware/MiddlewareService';
import EncryptionService from '../services/EncryptionService';
import { Pool } from 'pg';
import UserService from '../../modules/users/UsersService';
import { configureUsersDependencies } from '../../modules/users/users.dependencies';
import EmailService from '../services/EmailService';
import { configureGoogleDependencies } from '../../modules/google/google.dependencies';
import RedisService from '../services/RedisService';
import { RedisClientType } from 'redis';
import HttpService from '../services/HttpService';
import WebTokenService from '../services/WebtokenService';
import HttpRequestValidationService from '../services/HttpRequestValidationService';
import PasswordService from '../services/PasswordService';
import { configureTokensDependencies } from '../../modules/tokens/tokens.dependencies';
import { configureCalendarsDependencies } from '../../modules/calendars/calendars.dependencies';
import { configureEventsDependencies } from '../../modules/calendars/events/events.dependencies';
import { configureContactsDependencies } from '../../modules/contacts/contacts.dependencies';
import { configureEventAtendeesDependencies } from '../../modules/calendars/eventAtendees/eventAttendees.dependencies';
import { configurePipelinesDependencies } from '../../modules/opportunities/pipelines/pipelines.dependencies';
import { configureStagesDependencies } from '../../modules/opportunities/stages/stages.dependencies';
import { configureOpportunitiesDependencies } from '../../modules/opportunities/opportunities.dependencies';


export async function configureContainer(testPool?: Pool, testRedis?: string): Promise<void> {
    // pool //
    const pool =  testPool ?? await databaseInstance.getPool();
    Container.register<Pool>("Pool", pool);

    // Encryption //
    const encryptionService = new EncryptionService();
    Container.register<EncryptionService>("EncryptionService", encryptionService);

    // password //
    const passwordService = new PasswordService();
    Container.register<PasswordService>("PasswordService", passwordService);

    // webtoken //
    const webtokenService = new WebTokenService();
    Container.register<WebTokenService>("WebtokenService", webtokenService);

    // http request validation //
    const httpRequestValidationService = new HttpRequestValidationService();
    Container.register<HttpRequestValidationService>("HttpRequestValidationService", httpRequestValidationService);
    
    // errors //
    const errorHandler = new ErrorHandler(pool)
    Container.register("ErrorHandler", errorHandler);

    // email //
    const emailService = new EmailService();
    Container.register<EmailService>("EmailService", emailService);

    const httpService = new HttpService(httpRequestValidationService, passwordService, webtokenService, encryptionService);
    Container.register<HttpService>("HttpService", httpService);

     // redis // 
    const connectionUrl = testRedis ?? (process.env.REDIS_URL as string || "");
    const redisClient = await new RedisService(connectionUrl).createClient();
    Container.register<RedisClientType>("RedisClient", redisClient);
 

    // calendars //
    configureCalendarsDependencies(pool);

    // contacts //
    configureContactsDependencies(pool);

    // events // 
    configureEventsDependencies(pool);

    // event attendies //
    configureEventAtendeesDependencies(pool);
    
    // google //
    configureGoogleDependencies(pool);

    // opportunities //
    configureOpportunitiesDependencies(pool);

    // pipelines //
    configurePipelinesDependencies(pool);

    // stages // 
    configureStagesDependencies(pool);
    
    // tokens //
    configureTokensDependencies(pool);
    
    // users //
    configureUsersDependencies(pool);

    

    

   // middleware --- must configure users above this block //
    const usersService = Container.resolve<UserService>("UsersService");
    const middlewareService = new MiddlewareService(webtokenService, usersService, errorHandler);
    Container.register<MiddlewareService>("MiddlewareService", middlewareService);   
     
    return;
}