import { NextFunction, Request, Response } from "express";
import AppError from '../errors/AppError';
import { AuthenticationError, AuthorizationError } from "../../core/errors/errors";
import { ENVVariableError } from "../errors/errors";
import UsersService from "../../modules/users/UsersService";
import ErrorHandler from "../errors/ErrorHandler";
import crypto from 'crypto';
import { isUUID } from "validator";

import WebTokenService from "../services/WebtokenService";

export default class MiddlewareService {
    private usersService: UsersService;
    private errorHandler: ErrorHandler;
    private webtokenService: WebTokenService;

    constructor(webtokenService: WebTokenService, usersService: UsersService, errorHanlder: ErrorHandler) {
        this.webtokenService = webtokenService
        this.usersService = usersService;
        this.errorHandler = errorHanlder;
    }

    async auth(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.headers.authorization?.split(" ")[1];
    
            if(!token) {
                throw new AuthenticationError(undefined, {
                    headers: req.headers
                });
            }
    
            const decodedToken = this.webtokenService.decodeToken(token);
            
            if(!decodedToken) {
                throw new AuthenticationError("Invalid or expired token", {
                    token: decodedToken
                });
            };
    
            if(!decodedToken.userId) {
                throw new AuthorizationError("Forbidden", {
                    reason: "No userId in token",
                    token: decodedToken.userId
                }); 
            };

            if(!isUUID(decodedToken.userId)) {
                throw new AuthorizationError("Forbidden", {
                    reason: "Invalid id",
                    userId: decodedToken.userId
                })
            }
            
            const user = await this.usersService.resource("user_id", decodedToken.userId);

            if(!user) {
                
                throw new AuthorizationError("Forbidden", {
                    reason: "No user found",
                    user: user
                })
            }
           
            req.user = user;
            next();
        } catch (error) {
            next(error); 
        }
    }

    async verification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const { code } = req.body;
    
            if(!token || !code) {
               throw new AuthenticationError(undefined, {
                    headers: req.headers,
                    body: req.body
                });
            }
    
            const decodedToken = this.webtokenService.decodeToken(token);
            
            if(!decodedToken) {
                throw new AuthenticationError("Invalid or expired token", {
                    token: decodedToken
                });
            };
    
            if(!decodedToken.verificationCode) {
                throw new AuthorizationError("Forbidden", {
                    token: decodedToken
                }); 
            };

            if(decodedToken.verificationCode != code) {
                throw new AuthenticationError("Incorrect verification code", {
                    block: `middleware.codeValidation`,
                    code: code,
                    verificationCode: decodedToken.verificationCode
                });
            }

            
            return next();
        } catch (error) {
            next(error);
        }
    }

     async verifyHMAC(req: Request, res: Response, next: NextFunction): Promise<void> {
        if(!process.env.HMAC_SECRET) {
            throw new ENVVariableError("Missing HMAC_SECRET variable");
        }
        
        const secret = process.env.HMAC_SECRET;
        const hmacExcludedPaths = [""];
        const allowedDrift = 60_000;

        const shouldSkip = hmacExcludedPaths.some(path => req.path.startsWith(path));
        
        if (shouldSkip) {
            return next();
        }
       
        const signature = req.headers['x-signature'] as string;
        const payload = req.headers['x-payload'] as string;
    
        if (!signature || !payload) {
            throw new AuthorizationError(undefined, {
                block: "HMAC verification",
                signature: signature || "**MISSING**",
                payload: payload || "**MISSING**"
            });
        }
    
        const timestamp = parseInt(payload);

        if (isNaN(timestamp) || Math.abs(Date.now() - timestamp) > allowedDrift) {
            throw new AuthorizationError('Invalid or expired payload timestamp')
        }
    
        const expected = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
    
        if (signature !== expected) {
            throw new AuthorizationError(undefined, {
                block: "HMAC verification",
                signature: signature,
                expected: expected
            })
        }
    
        next();

    }

    async handleErrors(error: unknown, req: Request, res: Response, next: NextFunction): Promise<void> {
        const defaultErrorMessage = "Unable to process request at this time"
        try {
            await this.errorHandler.handleError(error);
    
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.statusCode === 500 ? defaultErrorMessage : error.message,
                    ...(process.env.NODE_ENV !== 'production' ? { context: error.context } : {}),
                });
                return; 
            }
    
            res.status(500).json({
                success: false,
                message: defaultErrorMessage,
            });
        } catch (loggingError) {
            console.error('Error handling failed:', loggingError);
            res.status(500).json({
                success: false,
                message: defaultErrorMessage,
            });
            return
        }
    };
}


