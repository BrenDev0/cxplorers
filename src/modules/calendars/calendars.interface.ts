export interface Calendar {
  calendar_id?: string;
  user_id: string;
  calendar_reference_id: string;
  title: string;
  description: string | null;
  background_color: string | null;
  foreground_color: string | null;
  watch_channel: string | null;
  channel_expiration_ms: number | null
}

export interface CalendarData {
   calendarId?: string;
  userId: string;
  calendarReferenceId: string;
  title: string;
  description: string | null;
  backgroundColor: string | null;
  foregroundColor: string | null;
  watchChannel: string | null;
  channelExpirationMs: number | null
}
