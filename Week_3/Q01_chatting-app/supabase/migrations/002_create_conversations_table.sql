-- Migration: Create conversations table
-- Description: Creates the conversations table for storing chat sessions
-- Version: 002
-- Date: 2026-01-30

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster session lookups
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (MVP - Public Access)
-- Note: For production, implement proper authentication with user_id column

-- Allow anyone to read conversations (MVP - no auth)
CREATE POLICY "Allow public read access"
  ON conversations
  FOR SELECT
  USING (true);

-- Allow anyone to insert conversations (MVP - no auth)
CREATE POLICY "Allow public insert access"
  ON conversations
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update conversations (MVP - no auth)
CREATE POLICY "Allow public update access"
  ON conversations
  FOR UPDATE
  USING (true);

-- Allow anyone to delete conversations (MVP - no auth)
CREATE POLICY "Allow public delete access"
  ON conversations
  FOR DELETE
  USING (true);
