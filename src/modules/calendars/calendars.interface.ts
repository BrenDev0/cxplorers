export interface Calendar {
  calendar_id: string;
  business_id: string;
  business_user_id: string;
  calendar_reference_id: string;
  title: string;
  description: string | null;
  background_color: string | null;
  foreground_color: string | null;
  watch_channel: string | null;
  watch_channel_resource_id:string | null;
  channel_expiration: string | null
}

export interface CalendarData {
  calendarId: string;
  businessId: string;
  businessUserId: string;
  calendarReferenceId: string;
  title: string;
  description: string | null;
  backgroundColor: string | null;
  foregroundColor: string | null;
  watchChannel: string | null;
  watchChannelResourceId: string | null;
  channelExpiration: string | null
}
