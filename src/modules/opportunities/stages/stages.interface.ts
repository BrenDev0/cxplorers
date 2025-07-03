import { IRepository } from "../../../core/repository/repository.interface";

export interface Stage {
  stage_id?: string;
  pipeline_id: string;
  name: string;
  position: number;
}

export interface StageData {
  stageId?: string;
  pipelineId: string;
  name: string;
  position: number;
}

export interface IStagesRepository extends IRepository<Stage> {
  upsert(cols: string[], values: Omit<Stage, "stage_id">[]): Promise<Stage[]>
}
