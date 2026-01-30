// lib/supabase.ts
// Supabase client configuration per spec.md

import { createClient } from '@supabase/supabase-js';
import type { Message, InsertMessage, Conversation, InsertConversation } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch messages for a given session, ordered by creation time
 */
export async function getMessagesBySession(sessionId: string): Promise<{
  data: Message[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  return {
    data: data as Message[] | null,
    error: error?.message ?? null,
  };
}

/**
 * Save a new message to the database
 */
export async function saveMessage(message: InsertMessage): Promise<{
  data: Message | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  return {
    data: data as Message | null,
    error: error?.message ?? null,
  };
}

/**
 * Get all conversations, ordered by most recent
 */
export async function getConversations(): Promise<{
  data: Conversation[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  return {
    data: data as Conversation[] | null,
    error: error?.message ?? null,
  };
}

/**
 * Get a conversation by session_id
 */
export async function getConversationBySessionId(sessionId: string): Promise<{
  data: Conversation | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  return {
    data: data as Conversation | null,
    error: error?.message ?? null,
  };
}

/**
 * Create a new conversation
 */
export async function createConversation(conversation: InsertConversation): Promise<{
  data: Conversation | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('conversations')
    .insert(conversation)
    .select()
    .single();

  return {
    data: data as Conversation | null,
    error: error?.message ?? null,
  };
}

/**
 * Update conversation title and updated_at timestamp
 */
export async function updateConversation(sessionId: string, title: string): Promise<{
  data: Conversation | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('session_id', sessionId)
    .select()
    .single();

  return {
    data: data as Conversation | null,
    error: error?.message ?? null,
  };
}

/**
 * Delete a conversation and its messages
 */
export async function deleteConversation(sessionId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  // Delete messages first
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('session_id', sessionId);

  if (messagesError) {
    return { success: false, error: messagesError.message };
  }

  // Delete conversation
  const { error: conversationError } = await supabase
    .from('conversations')
    .delete()
    .eq('session_id', sessionId);

  return {
    success: !conversationError,
    error: conversationError?.message ?? null,
  };
}
