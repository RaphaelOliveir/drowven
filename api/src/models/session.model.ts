export interface Session {
  id: string;
  user_id: string;
  is_active: boolean;
  expires_at: Date;
  created_at: Date;
}
