export interface Opportunity {
  opportunity_id: string;
  stage_id: string;
  contact_id: string;
  opportunity_value: string | null;
  opportunity_name?: string;
  opportunity_status?: string;
  user_id?: string;
  opportunity_source?: string;
  opportunity_business_name?: string;
  notes: string | null;
}

export interface OpportunityData {
  opportunityId: string;
  stageId: string;
  contactId: string;
  opportunityValue: number | null;
  opportunityName?: string;
  opportunityStatus?: string;
  userId?: string;
  opportunitySource?: string;
  opportunityBusinessName?: string;
  notes: string | null;
}
