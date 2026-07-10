export interface Conversation {
  id: string;
  sender_user_id: string;
  receiver_user_id: string;
  status: string;
  last_message_at: Date | null;
  last_message_id: string | null;
  created_at: Date;
  updated_at: Date;
  // Optional associations
  sender_name?: string;
  receiver_name?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
