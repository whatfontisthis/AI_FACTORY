// types/database.ts
// TypeScript types for Supabase database tables per spec.md

/**
 * Represents a message stored in the database
 */
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  session_id: string;
}

/**
 * Payload for inserting a new message
 * Excludes auto-generated fields (id, created_at)
 */
export interface InsertMessage {
  content: string;
  role: 'user' | 'assistant';
  session_id: string;
}

/**
 * Represents a conversation/session stored in the database
 */
export interface Conversation {
  id: string;
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

/**
 * Payload for inserting a new conversation
 */
export interface InsertConversation {
  session_id: string;
  title?: string;
}
