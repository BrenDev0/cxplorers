import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../../core/errors/errors";
import { RedisClientType } from "redis";
import Container from "../../core/dependencies/Container";
import GoogleService from "./GoogleService";
import EncryptionService from "../../core/services/EncryptionService";
import HttpService from "../../core/services/HttpService";

export default class GoogleController {
    private readonly block = "google.controller";
    private httpService: HttpService;
    private googleService: GoogleService; 
   
    constructor(httpService: HttpService , googleService: GoogleService) {
        this.httpService = httpService
        this.googleService = googleService
    }

    async callback(req: Request, res: Response): Promise<void> {
        const { code, state } = req.query;

        if (!code || !state) {
            throw new BadRequestError('Missing code or state');
        }

        const client = this.googleService.clientManager.getClient();

        const redisClient = Container.resolve<RedisClientType>("RedisClient");
        const session = await redisClient.get(`oauth_state:${state}`);
        if (!session) {
            throw new BadRequestError('Invalid or expired state');
        };

        console.log(code, "CODE::::::::::::")

        // Exchange authorization code for access token
        const { tokens } = await client.getToken(code as string);
        client.setCredentials(tokens);

        if(!tokens.refresh_token) {
            throw new BadRequestError("Google authorization failed");
        }
        
        const encryptionService: EncryptionService = Container.resolve("EncryptionService");
        const sessionData = {
          refreshToken: encryptionService.encryptData(tokens.refresh_token),
    
        }

        console.log(tokens)

        await redisClient.setEx(`oauth_state:${state}`, 900, JSON.stringify(sessionData))
       
        
        res.redirect(`https://broker-app-pearl.vercel.app/account/create/${state}`);
    }

    async getUrl(req: Request, res: Response): Promise<void> {
        try {
            const client = this.googleService.clientManager.getClient()
            const url = this.googleService.getUrl(client);

            res.status(200).json({
                url: url
            })
        } catch (error) {
            throw error;
        }
    }   
}

   