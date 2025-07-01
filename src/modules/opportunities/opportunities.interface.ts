export interface Opportunity {
  opportunity_id: string;
  stage_id: string;
  contact_id: string;
  opportunity_value: string | null;
  notes: string | null;
}

export interface OpportunityData {
  opportunityId: string;
  stageId: string;
  contactId: string;
  opportunityValue: number | null;
  notes: string | null;
}
