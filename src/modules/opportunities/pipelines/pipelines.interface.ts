export interface Pipeline {
  pipeline_id: string;
  business_id: string;
  name: string;
  in_pie_chart: boolean;
  in_funnel_chart: boolean;
  created_at?: Date
}

export interface PipelineData {
  pipelineId: string;
  businessId: string;
  name: string;
  inPieChart: boolean;
  inFunnelChart: boolean;
  createdAt?: Date
}
