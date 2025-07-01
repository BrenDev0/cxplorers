import { Request, Response } from "express";
import HttpService from "../../core/services/HttpService"
import { BadRequestError, NotFoundError } from "../../core/errors/errors";
import OpportuniesService from "./OpportunitiesService";
import { OpportunityData } from "./opportunities.interface";
import { StageData } from "../stages/stages.interface";
import { PipelineData } from "../pipelines/pipelines.interface";
import { ContactData } from "../contacts/contacts.interface";

export default class OpportunitiesController { 
  private httpService: HttpService;
  private opportuniesService: OpportuniesService;  
  private block = "opportunies.controller"; 
  

  constructor(httpService: HttpService, opportuniesService: OpportuniesService) {
    this.httpService = httpService;
    this.opportuniesService = opportuniesService;
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.createRequest`;
    try {
      const user = req.user;
      const requiredFields = ["contactId", "stageId"];
      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
      
      const { contactId, stageId } = req.body;
      this.httpService.requestValidation.validateUuid(contactId, "contactId", block);
      this.httpService.requestValidation.validateUuid(stageId, "stageId", block);
      
      const [stageResource, contactResource] = await Promise.all([
        this.httpService.requestValidation.validateResource<StageData>(stageId, "StagesService", "Stage not found", block),
        this.httpService.requestValidation.validateResource<ContactData>(contactId, "ContactsService", "Contact not found", block)
      ]);
      
      const pipelineResource =  await this.httpService.requestValidation.validateResource<PipelineData>(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
      this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);
      this.httpService.requestValidation.validateActionAuthorization(user.user_id, contactResource.userId, block);

      await this.opportuniesService.create(req.body);

      res.status(200).json({ message: "Opportunity added." });
    } catch (error) {
      throw error;
    }
  }

  async resourceRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.resourceRequest`;
    try {
      const user = req.user;
      const opportunityId = req.params.opportunityId;
      this.httpService.requestValidation.validateUuid(opportunityId, "opprotunityId", block);

      const opportunityResource = await this.httpService.requestValidation.validateResource<OpportunityData>(opportunityId, "OpportunitiesService", "Opportunity notfound", block);
      
      const stageResource = await this.httpService.requestValidation.validateResource<StageData>(opportunityResource.stageId, "StagesService", "Stage not found", block);
      
      const pipelineResource = await this.httpService.requestValidation.validateResource<PipelineData>(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
      this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);

      res.status(200).json({ data: opportunityResource })
    } catch (error) {
      throw error;
    }
  }

  async collectionRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.collectionRequest`
    try {
      const user = req.user;
      
      const stageId = req.params.stageId;
      this.httpService.requestValidation.validateUuid(stageId, "stageId", block);

      const stageResource = await this.httpService.requestValidation.validateResource<StageData>(stageId, "StagesService", "Stage not found", block);
      const dataPromise = this.opportuniesService.collection(stageId);
      
      const pipelineResource = await this.httpService.requestValidation.validateResource<PipelineData>(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
      this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);

      const data = await dataPromise;

      res.status(200).json({ data })
    } catch (error) {
      throw error
    }
  }

  async updateRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.updateRequest`;
    try { 
      const user = req.user;
      const opportunityId = req.params.opportunityId;
      this.httpService.requestValidation.validateUuid(opportunityId, "opprotunityId", block);

      const opportunityResource = await this.httpService.requestValidation.validateResource<OpportunityData>(opportunityId, "OpportunitiesService", "Opportunity notfound", block);
      
      const stageResource = await this.httpService.requestValidation.validateResource<StageData>(opportunityResource.stageId, "StagesService", "Stage not found", block);
      
      const pipelineResource = await this.httpService.requestValidation.validateResource<PipelineData>(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
      this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);
      
      const allowedChanges = ["opportunityValue", "notes"];

      const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<OpportunityData>(allowedChanges, req.body, block);

      await this.opportuniesService.update(opportunityId, filteredChanges);

      res.status(200).json({ message: "Opportunity updated" });
    } catch (error) {
      throw error;
    }
  }

  async deleteRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.deleteRequest`;
    try {
      const user = req.user;
      const opportunityId = req.params.opportunityId;
      this.httpService.requestValidation.validateUuid(opportunityId, "opprotunityId", block);

      const opportunityResource = await this.httpService.requestValidation.validateResource<OpportunityData>(opportunityId, "OpportunitiesService", "Opportunity notfound", block);
      
      const stageResource = await this.httpService.requestValidation.validateResource<StageData>(opportunityResource.stageId, "StagesService", "Stage not found", block);
      
      const pipelineResource = await this.httpService.requestValidation.validateResource<PipelineData>(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
      this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);

      await this.opportuniesService.delete(opportunityId);

      res.status(200).json({ message: "Opportunity deleted"})
    } catch (error) {
      throw error;
    }
  }
}
