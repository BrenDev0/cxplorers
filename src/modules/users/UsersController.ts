import { Request, Response } from "express";
import { BadRequestError } from "../../core/errors/errors";
import UsersService from "./UsersService";
import { UserData } from "./users.interface";
import EmailService from "../../core/services/EmailService";
import HttpService from "../../core/services/HttpService";

export default class UsersController { 
  private httpService: HttpService;
  private usersService: UsersService; 
  private emailService: EmailService; 
  private block = "users.controller"; 

  constructor(httpService: HttpService, usersService: UsersService, emailService: EmailService) {
    this.httpService = httpService
    this.usersService = usersService;
    this.emailService = emailService;
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
      const block = `${this.block}.verifyEmail`
      try {
          const { email } = req.body;
          const requiredFields = ["email"]
      
          const update = req.query.update === "true";

          this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

          const encryptedEmail = this.httpService.encryptionService.encryptData(email);

          const emailExists = await this.usersService.resource("email", encryptedEmail);

          if(emailExists) {
              throw new BadRequestError("Email in use", {
                  block: `${block}.emailExists`,
                  email: email
              })
          }

          const requestType = update ? "UPDATE": "NEW"

          const token = await this.emailService.handleRequest(email, requestType, this.httpService.webtokenService);

          res.status(200).json({
              message: "Verification email sent.",
              token: token
          })
      } catch (error) {
          throw error;
      }
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.createRequest`;
    try {
      const { email, password, phone, name } = req.body;
      const requiredFields =  ["email", "password", "phone", "name"]
     
      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

      const hashedPassword = await this.httpService.passwordService.hashPassword(password);

      const userData = {
        ...req.body,
        password: hashedPassword,
       
      };

      await this.usersService.create(userData);

      res.status(200).json({ message: "User added." });
    } catch (error) {
      throw error;
    }
  }

  async resourceRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.resourceRequest`;
    try {
      const user = req.user;

      const data = this.usersService.mapFromDb(user);
      res.status(200).json({ data: data }); 
    } catch (error) {
      throw error;
    }
  }

  async updateRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.updateRequest`;
    try { 
      const user = req.user;
      const allowedChanges = ["phone", "name", "password"];

      const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<UserData>(allowedChanges, req.body, block);

      if(req.body.password){
        const { password, oldPassword } = req.body;
        if(!oldPassword) {
          throw new BadRequestError("Current password required for password update");
        };

        const correctPassword = this.httpService.passwordService.comparePassword(oldPassword, user.password);
        if(!correctPassword) {
          throw new BadRequestError("Incorrect password")
        }

        const hashedPassword = await this.httpService.passwordService.hashPassword(password);

        filteredChanges.password = hashedPassword
      }

      await this.usersService.update(user.user_id, filteredChanges);

      res.status(200).json({ message: "User updated" });
    } catch (error) {
      throw error;
    }
  }

  async verifiedUpdateRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.verifiedUpdateRequest`;
    try {
      const userId = req.params.userId;
      const user = await this.usersService.resource("user_id", userId);
      if(!user) {
        throw new BadRequestError(undefined, {
          block: `${block}.userCheck`,
          user: user || "user not found"
        })
      }
      const allowedChanges = ["email", "password"];
      const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<UserData>(allowedChanges, req.body, block);

      if(filteredChanges.password) {
        const hashedPassword = await this.httpService.passwordService.hashPassword(filteredChanges.password);
        filteredChanges.password = hashedPassword;
      }

      await this.usersService.update(userId, filteredChanges);

      res.status(200).json({ message: "User updated"})
    } catch (error) {
      throw error;
    }
  }

  async deleteRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.deleteRequest`;
    try {
     const user = (req as any).user;

     await this.usersService.delete(user.user_id);

     res.status(200).json({ message: "User Deleted"})
    } catch (error) {
      throw error;
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const block  = `${this.block}.login`
    try {
        const { email, password } = req.body;
        const requiredFields =  ["email", "password"];

        this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

        const encryptedEmail = this.httpService.encryptionService.encryptData(email)
        const userExists = await this.usersService.resource("email", encryptedEmail);

        if(!userExists) {
            throw new BadRequestError("Incorrect email or password", {
                block: `${block}.userExists`,
                email: email,
                userExists: userExists || "No user found in db"
            })
        };

        const correctPassword = await this.httpService.passwordService.comparePassword(password, userExists.password!);

        if(!correctPassword) {
            throw new BadRequestError("Incorrect email or password", {
                block: `${block}.passwordValidation`,
                correctPassword: false
            })
        };

        const token = this.httpService.webtokenService.generateToken({
            userId: userExists.user_id!
        }, "7d")

        res.status(200).json({ 
            token: token
        })
    } catch (error) {
        throw error;
    }
  }

  async accountRecoveryEmail(req: Request, res: Response): Promise<void> {

    const block  = `${this.block}.accountRecoveryEmail`
    try {
      const { email } = req.body;
      const requiredFields =  ["email"];

      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

      const encryptedEmail = this.httpService.encryptionService.encryptData(email);
      const emailExists = await this.usersService.resource("email", encryptedEmail);

      if(!emailExists) {
          throw new BadRequestError("Incorrect email", {
              block: `${block}.emailCheck`,
              email: email,
              emailExists: emailExists || "No user found in db"
          })
      };

      const token = await this.emailService.handleRequest(email, "RECOVERY", this.httpService.webtokenService)

      res.status(200).json({ 
        message: "Recovery email sent",
        token: token
      });
    } catch (error) {
        throw error;
    }
  }
}
