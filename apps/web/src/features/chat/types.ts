export interface ChatConversation {
  id: string;
  name: string;
  username: string | null;
  avatarIdx: number;
  pinned?: boolean;
  unread: number;
  lastAt: string;
  last: string;
  online?: boolean;
  group?: boolean;
  members?: number;
}

export interface ChatMessage {
  id: string;
  from: "me" | "them";
  who?: string;
  at: string;
  text: string;
  reactions?: Array<{ emoji: string; count: number }>;
}
