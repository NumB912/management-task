export interface INotification {
  id: string;
  user: string;
  event: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: Date;
}
