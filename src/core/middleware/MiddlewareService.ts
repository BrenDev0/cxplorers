import { NextFunction, Request, Response } from "express";
import AppError from '../errors/AppError';
import { AuthenticationError, AuthorizationError, NotFoundError } from "../../core/errors/errors";
import { ENVVariableError } from "../errors/errors";
import UsersService from "../../modules/users/UsersService";
import ErrorHandler from "../errors/ErrorHandler";
import crypto from 'crypto';
import { isUUID } from "validator";

import WebTokenService from "../services/WebtokenService";
import Container from "../dependencies/Container";
import BusinessUsersService from "../../modules/businesses/businessUsers/BusinessUsersService";
import { BusinessUserData } from "../../modules/businesses/businessUsers/businessUsers.interface";
import { PermissionData } from "../../modules/permissions/permissions.interface";
import PermissionsService from "../../modules/permissions/PermissionsService";
import HttpService from "../services/HttpService";

export default class MiddlewareService {
    private httpService: HttpService;
    private usersService: UsersService;
    private errorHandler: ErrorHandler;

    constructor(httpService: HttpService, usersService: UsersService, errorHanlder: ErrorHandler) {
        this.httpService = httpService;
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
    
            const decodedToken = this.httpService.webtokenService.decodeToken(token);


            
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

            this.httpService.requestValidation.validateUuid(decodedToken.userId, "userId", "middleware.auth.user");

            const user = await this.usersService.resource("user_id", decodedToken.userId);
            if(!user) {
                throw new AuthorizationError("Forbidden", {
                    reason: "No user found",
                    user: user
                })
            }
            
            if(decodedToken.businessId) {
                this.httpService.requestValidation.validateUuid(decodedToken.businessId, "businessId", "middleware.auth.business")
            
                const businessUser = await this.getBusinessUser(user.user_id, decodedToken.businessId);
                if(!businessUser) {
                    throw new AuthorizationError("Forbidden", {
                        reason: "No business user found"
                    })
                }

                const permissions = await this.getUserPermissions(businessUser.businessUserId)
            
                req.user = user;
                req.businessId = decodedToken.businessId;
                req.businessUserId = businessUser.businessUserId;
                req.permissions = permissions;
                req.role = businessUser.role
                return next();
            };

            req.user = user;
            next();
        } catch (error) {
            console.log("MIDDLEWARE ERROR:::::::::::::", error)
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
    
            const decodedToken = this.httpService.webtokenService.decodeToken(token);
            
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

    verifyRoles(allowed: string[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
            try {
                const role = req.role;

                if (!role || !allowed.includes(role)) {
                    throw new AuthorizationError(undefined, {
                        block: "middleware.verifyRoles",
                    });
                }

                return next();
            } catch (error) {
                return next(error);
            }
        };
    }

    verifyAdminAccount(){
        return (req: Request, res: Response, next: NextFunction): void => {
            try {
                const user = req.user;
                console.log("USER::::", user)
                if(!user.is_admin) {
                    throw new AuthorizationError(undefined, {
                        block: "middleware.verifyRoles",
                    });
                }

                return next();
            } catch (error) {
                return next(error);
            }
        };
    }

    verifyPermissions(module: string, actions: string[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
            try {

                if(req.user.is_admin && req.role === "owner"){
                    return  next()
                }
                
                const permissions = req.permissions as PermissionData[];

                if (!permissions || !Array.isArray(permissions)) {
                    throw new AuthorizationError("Permissions not found or invalid", {
                        module,
                        actions
                    });
                }

                const hasPermission = permissions.some(
                    (perm) =>
                        perm.moduleName === module && actions.includes(perm.action)
                );

                if (!hasPermission) {
                    throw new AuthorizationError("Forbidden: Missing required permissionS", {
                        required: { module, actions },
                        permissions
                    });
                }

                return next();
            } catch (error) {
                return next(error);
            }
        };
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

    private async getBusinessUser(userId: string, businessId: string): Promise<BusinessUserData | null> {
        try {
            const businessUsersService = Container.resolve<BusinessUsersService>("BusinessUsersService");
            const businessUser = await businessUsersService.selectByIds(userId, businessId);

            return businessUser;
        } catch (error) {
            throw error
        }
    }

    private async getUserPermissions(businessUserId: string): Promise<PermissionData[]> {
        const permissionsService = Container.resolve<PermissionsService>("PermissionsService");
        const permissions = await permissionsService.collection(businessUserId);

        return permissions;
    }
}


