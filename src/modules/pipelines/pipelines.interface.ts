export interface Pipeline {
  pipeline_id: string;
  user_id: string;
  name: string;
  created_at?: Date
}

export interface PipelineData {
  pipelineId: string;
  userId: string;
  name: string;
  createdAt?: Date
}
