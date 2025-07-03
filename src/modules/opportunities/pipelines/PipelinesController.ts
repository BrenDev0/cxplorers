import { Request, Response } from "express";
import HttpService from "../../../core/services/HttpService"
import { AuthorizationError, BadRequestError, NotFoundError } from "../../../core/errors/errors";
import PipelinesService from "./PipelinesService";
import { PipelineData } from "./pipelines.interface";
import Container from "../../../core/dependencies/Container";
import StagesService from "../stages/StagesService";

export default class PipelinesController { 
  private httpService: HttpService;
  private pipelinesService: PipelinesService;  
  private block = "pipelines.controller"; 
  

  constructor(httpService: HttpService, pipelinesService: PipelinesService) {
    this.httpService = httpService;
    this.pipelinesService = pipelinesService;
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.createRequest`;
    try {
      const user = req.user
      const requiredFields = ["name"];
      this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

      const pipelineData = {
        ...req.body,
        userId: req.user.user_id
      };

      const newPipeline = await this.pipelinesService.create(pipelineData);

      if(req.body.stages) {
        const { stages } = req.body;
        
        const stagesService = Container.resolve<StagesService>("StagesService");

        if(!Array.isArray(stages)) {
          throw new BadRequestError("Invalid data format", {
            block: block,
            detail: "Property 'Stages' must be of type array",
            typeInReq: typeof stages
          })
        }

        const mappedStages = stages.map((stage) => {
          return {
            ...stage,
            pipelineId: newPipeline.pipeline_id
          }
        })

        await stagesService.upsert(mappedStages);
      }

      res.status(200).json({ message: "pipeline added." });
    } catch (error) {
      throw error;
    }
  }

  async resourceRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.resourceRequest`;
    try {
      const user = req.user;
      const pipelineId = req.params.pipelineId;

      const resource = await this.httpService.requestValidation.validateResource<PipelineData>(pipelineId, "PipelinesService", "Pipeline not found", block);
      this.httpService.requestValidation.validateActionAuthorization(user.user_id, resource.userId, block);

      res.status(200).json({ data: resource })
    } catch (error) {
      throw error;
    }
  }

  async collectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const data = await this.pipelinesService.collection(user.user_id);

      res.status(200).json({ data })
    } catch (error) {
      throw error
    }
  }

  async updateRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.updateRequest`;
    try { 
      const user = req.user;
      const pipelineId = req.params.pipelineId;
      this.httpService.requestValidation.validateUuid(pipelineId, "pipelineId", block)

     const resource = await this.httpService.requestValidation.validateResource<PipelineData>(pipelineId, "PipelinesService", "Pipeline not found", block);
      this.httpService.requestValidation.validateActionAuthorization(user.user_id, resource.userId, block);

      const allowedChanges = ["name", "stages"];

      const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<PipelineData>(allowedChanges, req.body, block);
      
      if(req.body.stages) {
        const { stages } = req.body;

        if(!Array.isArray(stages)) {
          throw new BadRequestError("Invalid data format", {
            block: block,
            detail: "Property 'Stages' must be of type array",
            typeInReq: typeof stages
          })
        };

        const stagesService = Container.resolve<StagesService>("StagesService");
        const stagesData = [];
        for(const stage of stages) {
          const requiredStageFields = ["name", "pipelineId", "position", "stageId"];
          this.httpService.requestValidation.validateRequestBody(requiredStageFields, stage, block);

          stagesData.push(stage)
        }
        await stagesService.upsert(stagesData);
      }

      if(filteredChanges.name) {
        await this.pipelinesService.update(pipelineId, filteredChanges)
      }

      res.status(200).json({ message: "pipeline updated" });
    } catch (error) {
      throw error;
    }
  }

  async deleteRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.deleteRequest`;
    try {
     const user = req.user;
      const pipelineId = req.params.pipelineId;
      this.httpService.requestValidation.validateUuid(pipelineId, "pipelineId", block)

     const resource = await this.httpService.requestValidation.validateResource<PipelineData>(pipelineId, "PipelinesService", "Pipeline not found", block);
      this.httpService.requestValidation.validateActionAuthorization(user.user_id, resource.userId, block);

      await this.pipelinesService.delete(pipelineId);

      res.status(200).json({ message: "Pipeline deleted" })
    } catch (error) {
      throw error;
    }
  }
}
