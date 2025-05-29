import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../../core/errors/errors";
import { RedisClientType } from "redis";
import Container from "../../core/dependencies/Container";
import GoogleService from "./GoogleService";
import EncryptionService from "../../core/services/EncryptionService";
import { OAuth2Client } from "google-auth-library";
import UsersService from "../users/UsersService";
import Controller from "../../core/class/Controller";



export default class GoogleController extends Controller{
    private readonly block = "google.controller";
    private client: OAuth2Client
    private googleService: GoogleService; 
    private readonly filterOptions = {
        SHEET: "sheet",
        FOLDER: "folder"
    }
    constructor(client: OAuth2Client, googleService: GoogleService) {
        super();
        this.client = client;
        this.googleService = googleService
    }

    async callback(req: Request, res: Response): Promise<void> {
        const { code, state } = req.query;

        if (!code || !state) {
            throw new BadRequestError('Missing code or state');
        }

        const redisClient: RedisClientType = Container.resolve("RedisClient");
        const session = await redisClient.get(`oauth_state:${state}`);
        if (!session) {
            throw new BadRequestError('Invalid or expired state');
        };

        // Exchange authorization code for access token
        const { tokens } = await this.client.getToken(code as string);
        this.client.setCredentials(tokens);

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
            const url = this.googleService.getUrl(this.client);

            res.status(200).json({
                url: url
            })
        } catch (error) {
            throw error;
        }
    }

  
  // async credentializeClient(userId: number): Promise<UserGoogleInfo> {
  //     const usersService: UsersService = Container.resolve("UsersService");
  //     const user = await usersService.getGoogleInfo(userId);
      
  //     this.client.setCredentials({
  //         refresh_token: user.refresh_token
  //     })

  //     const accessToken = await this.googleService.refreshAccessToken(this.client);

  //     this.client.setCredentials({
  //         access_token: accessToken
  //     })
  //     return user;
  // } 
}

   