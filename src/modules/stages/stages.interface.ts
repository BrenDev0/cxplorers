import { IRepository } from "../../core/repository/repository.interface";

export interface Stage {
  stage_id: string;
  pipeline_id: string;
  name: string;
}

export interface StageData {
  stageId: string;
  pipelineId: string;
  name: string;
}

export interface IStagesRepository extends IRepository<Stage> {
  createMany(cols: string[], values: Omit<Stage, "stage_id">[]): Promise<Stage[]>
}
