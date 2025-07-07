import { IRepository } from "../../../core/repository/repository.interface";

export interface Stage {
  stage_id?: string;
  pipeline_id: string;
  name: string;
  position: number;
  in_pie_chart: boolean;
  in_funnel_chart: boolean;
}

export interface StageData {
  stageId?: string;
  pipelineId: string;
  name: string;
  position: number;
  inPieChart: boolean;
  inFunnelChart: boolean;
}

export interface IStagesRepository extends IRepository<Stage> {
  upsert(cols: string[], values: Omit<Stage, "stage_id">[]): Promise<Stage[]>
}
