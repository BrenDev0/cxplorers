import { Request, Response } from "express";
import HttpService from "../../core/services/HttpService"
import { AuthorizationError, BadRequestError, NotFoundError } from "../../core/errors/errors";
import TokensService from "./TokensService";
import { TokenData } from "./tokens.interface";

export default class TokensController { 
  private httpService: HttpService;
  private tokensService: TokensService;  
  private block = "tokens.controller"; 
  

  constructor(httpService: HttpService, tokensService: TokensService) {
    this.httpService = httpService;
    this.tokensService = tokensService;
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.createRequest`;
    try {
      const user = req.user;
      const businessId = req.businessId;
      const requiredFields = ["token", "type", "service"];

      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
      const { token, service, type} = req.body;

      const usersTokens = await this.tokensService.collection(businessId);
      const tokenExist = usersTokens.find(
        (token) => token.type === type && token.service === service
      );

      const tokenData = {
        ...req.body,
        businessId
      };

      if(tokenExist) {
        await this.tokensService.update(tokenExist.tokenId!, tokenData);
        res.status(200).json({ message: "Token updated"});
        return;
      }

      await this.tokensService.create(tokenData);

      res.status(200).json({ message: "Token added." });
    } catch (error) {
      throw error;
    }
  }

  async resourceRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.resourceRequest`;
    try {
      const user = req.user;
      const businessId = req.businessId;
      const tokenId = req.params.tokenId;
      this.httpService.requestValidation.validateUuid(tokenId, "tokenId", block);

      const resource = await this.httpService.requestValidation.validateResource<TokenData>(tokenId, "TokensService", "Token not found", block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, resource.businessId, block);

      res.status(200).json({ data: resource})
    } catch (error) {
      throw error;
    }
  }

  async updateRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.updateRequest`;
    try { 
      const user = req.user;
      const businessId = req.businessId;
      const tokenId = req.params.tokenId;
      this.httpService.requestValidation.validateUuid(tokenId, "tokenId", block);

     const resource = await this.httpService.requestValidation.validateResource<TokenData>(tokenId, "TokensService", "Token not found", block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, resource.businessId, block);

      const allowedChanges = ["token", "type", "service"];

      const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<TokenData>(allowedChanges, req.body, block);

      await this.tokensService.update(tokenId, filteredChanges);

      res.status(200).json({ message: "token updated" });
    } catch (error) {
      throw error;
    }
  }

  async deleteRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.deleteRequest`;
    try {
      const user = req.user;
      const businessId = req.businessId;
      const tokenId = req.params.tokenId;
      this.httpService.requestValidation.validateUuid(tokenId, "tokenId", block);

     const resource = await this.httpService.requestValidation.validateResource<TokenData>(tokenId, "TokensService", "Token not found", block);
      this.httpService.requestValidation.validateActionAuthorization(businessId, resource.businessId, block);

      await this.tokensService.delete(tokenId);
      res.status(200).json({ message: "Token deleted"})
    } catch (error) {
      throw error;
    }
  }
}
