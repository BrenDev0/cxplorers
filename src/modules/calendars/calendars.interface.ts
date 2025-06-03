export interface Calendar {
  calendar_id?: string;
  user_id: string;
  reference_id: string;
  title: string;
  description: string | null;
  background_color: string | null;
  foreground_color: string | null;
}

export interface CalendarData {
   calendarId?: string;
  userId: string;
  referenceId: string;
  title: string;
  description: string | null;
  backgroundColor: string | null;
  foregroundColor: string | null;
}
