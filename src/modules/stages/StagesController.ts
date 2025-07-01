import { Request, Response } from "express";
import HttpService from "../../core/services/HttpService"
import { BadRequestError} from "../../core/errors/errors";
import StagesService from "./StagesService";
import { StageData } from "./stages.interface";
import { PipelineData } from "../pipelines/pipelines.interface";

export default class StagesController { 
  private httpService: HttpService;
  private stagesService: StagesService;  
  private block = "stages.controller"; 

  

  constructor(httpService: HttpService, stagesService: StagesService) {
    this.httpService = httpService;
    this.stagesService = stagesService;
  }

  // async createRequest(req: Request, res: Response): Promise<void> {
  //   const block = `${this.block}.createRequest`;
  //   try {
  //     const user = req.user;
  //     const pipelineId = req.params.pipelineId;
  //     this.httpService.requestValidation.validateUuid(pipelineId, "pipelineId", block);

      
  //     const pipelineResource = await this.httpService.requestValidation.validateResource<PipelineData>(pipelineId, "PipelinesService", "Pipeline not found", block)

  //     this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);
      
  //     const requiredFields = ["stages"];
  //     this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);

  //     const { stages } = req.body;

  //     if(!Array.isArray(stages)) {
  //       throw new BadRequestError("Invalid data format", {
  //         block: block,
  //         detail: "Property 'Stages' must be of type array",
  //         typeInReq: typeof stages
  //       })
  //     }

  //     const mappedStages = stages.map((stage) => {
  //       return {
  //         ...stage,
  //         pipelineId: pipelineId
  //       }
  //     })

  //     await this.stagesService.createMany(mappedStages);

  //     res.status(200).json({ message: "stages added." });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async resourceRequest(req: Request, res: Response): Promise<void> {
  //   const block = `${this.block}.resourceRequest`;
  //   try {
  //     const stageId = 
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async collectionRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.collectionRequest`;
    try {
      const user = req.user;
      const pipelineId = req.params.pipelineId;
      this.httpService.requestValidation.validateUuid(pipelineId, "pipelineId", block);

      const pipelineResource = await this.httpService.requestValidation.validateResource<PipelineData>(pipelineId, "PipelineService", "Pipeline not found", block)

      this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block)

      const data = await this.stagesService.collection(pipelineId);

      res.status(200).json({ data: data })
    } catch (error) {
      throw error
    }
  }

  // async updateRequest(req: Request, res: Response): Promise<void> {
  //   const block = `${this.block}.updateRequest`;
  //   try { 
  //     const user = req.user;
  //     const stageId = req.params.stageId;
  //     this.httpService.requestValidation.validateUuid(stageId, "stageId", block);

  //     const stageResource = await this.httpService.requestValidation.validateResource<StageData>(stageId, "StagesService", "Stage not found", block);
      
  //     const pipelineResource = await this.httpService.requestValidation.validateResource<PipelineData>(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
  //     this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);

  //     const allowedChanges = ["name"];

  //     const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<StageData>(allowedChanges, req.body, block);

  //     await this.stagesService.update(stageId, filteredChanges);

  //     res.status(200).json({ message: "Stage updated" });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async deleteRequest(req: Request, res: Response): Promise<void> {
    const block = `${this.block}.deleteRequest`;
    try {
     const user = req.user;
      const stageId = req.params.stageId;
      this.httpService.requestValidation.validateUuid(stageId, "stageId", block);

      const stageResource = await this.httpService.requestValidation.validateResource<StageData>(stageId, "StagesService", "Stage not found", block);
      
      const pipelineResource = await this.httpService.requestValidation.validateResource<PipelineData>(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
      this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);

      await this.stagesService.delete(stageId);

      res.status(200).json({ message: "Stage deleted" })
    } catch (error) {
      throw error;
    }
  }
}
