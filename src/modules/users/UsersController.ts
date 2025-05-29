import { Request, Response } from "express";
import Controller from "../../core/class/Controller";
import { BadRequestError } from "../../core/errors/errors";
import UsersService from "./UsersService";
import { UserData } from "./users.interface";
import EmailService from "../../core/services/EmailService";

export default class UsersController extends Controller { 
  private usersService: UsersService; 
  private emailService: EmailService; 
  private block = "users.controller"; 

  constructor(usersService: UsersService, emailService: EmailService) {
    super();
    this.usersService = usersService;
    this.emailService = emailService;
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
      const block = `${this.block}.verifyEmail`
      try {
          const { email } = req.body;
      
          const update = req.query.update === "true";

          if(!email) {
              throw new BadRequestError("All fields required.", {
              block: `${this.block}.dataValidation`,
              request: req.body
              })
          };

          const encryptedEmail = this.encryptionService.encryptData(email);

          const emailExists = await this.usersService.resource("email", encryptedEmail);

          if(emailExists) {
              throw new BadRequestError("Email in use", {
                  block: `${block}.emailExists`,
                  email: email
              })
          }

          const requestType = update ? "UPDATE": "NEW"

          const token = await this.emailService.handleRequest(email, requestType, this.webtokenService);

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
     

      if (!email || !password || !phone || !name) {
        throw new BadRequestError(undefined, {
          block: `${block}.dataValidation`,
          request: req.body,
        });
      }

      const hashedPassword = await super.hashPassword(password);

      const userData = {
        email: email,
        password: hashedPassword,
        name: name,
        phone: phone
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
      const user = (req as any).user;

      const data = this.usersService.mapFromDb(user);
      res.status(200).json({ data: data }); 
    } catch (error) {
      throw error;
    }
  }

  async updateRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.updateRequest`;
    try { 
      const user = (req as any).user;
      const allowedChanges = ["phone", "name", "password"];

      const filteredChanges = super.filterUpdateRequest<UserData>(allowedChanges, req.body, block);

      if(req.body.password){
        const { password, oldPassword } = req.body;
        if(!oldPassword) {
          throw new BadRequestError("Current password required for password update");
        };

        const correctPassword = super.comparePassword(oldPassword, user.password);
        if(!correctPassword) {
          throw new BadRequestError("Incorrect password")
        }

        const hashedPassword = await super.hashPassword(password);

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
      const userId = Number(req.params.userId);
      super.validateId(userId, "userId", block);
      const allowedChanges = ["email", "password"];
      const filteredChanges = super.filterUpdateRequest<UserData>(allowedChanges, req.body, block);

      if(filteredChanges.password) {
        const hashedPassword = await super.hashPassword(filteredChanges.password);
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

        if(!email || !password) {
            throw new BadRequestError("All fields required", {
                block: `${block}.dataValidation`,
                request: req.body
            })
        };

        const encryptedEmail = this.encryptionService.encryptData(email)
        const userExists = await this.usersService.resource("email", encryptedEmail);

        if(!userExists) {
            throw new BadRequestError("Incorrect email or password", {
                block: `${block}.userExists`,
                email: email,
                userExists: userExists
            })
        };

        const correctPassword = await super.comparePassword(password, userExists.password!);

        if(!correctPassword) {
            throw new BadRequestError("Incorrect email or password", {
                block: `${block}.passwordValidation`,
                correctPassword: false
            })
        };

        const token = this.webtokenService.generateToken({
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

      const encryptedEmail = this.encryptionService.encryptData(email);
      const emailExists = await this.usersService.resource("email", encryptedEmail);

      if(!emailExists) {
          throw new BadRequestError("Incorrect email", {
              block: `${block}.emailInUse`,
              email: email
          })
      };

      const token = await this.emailService.handleRequest(email, "RECOVERY", this.webtokenService)

      res.status(200).json({ 
        message: "Recovery email sent",
        token: token
      });
    } catch (error) {
        throw error;
    }
  }
}
