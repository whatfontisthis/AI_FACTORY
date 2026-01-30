-- Migration: Create messages table
-- Description: Creates the messages table for storing chat messages per spec.md
-- Version: 001
-- Date: 2026-01-28

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT NOT NULL
);

-- Create index for faster session queries
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (MVP - Public Access)
-- Note: For production, implement proper authentication with user_id column

-- Allow anyone to read messages (MVP - no auth)
CREATE POLICY "Allow public read access"
  ON messages
  FOR SELECT
  USING (true);

-- Allow anyone to insert messages (MVP - no auth)
CREATE POLICY "Allow public insert access"
  ON messages
  FOR INSERT
  WITH CHECK (true);
