-- ============================================
-- MIKKAL DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- Conversations table
CREATE TABLE conversations (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      TEXT NOT NULL,
  title        TEXT DEFAULT 'New Chat',
  last_message TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id  UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id          TEXT NOT NULL,
  role             TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content          TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      TEXT UNIQUE NOT NULL,
  display_name TEXT,
  nickname     TEXT,
  personal_note TEXT,
  birthday     DATE,
  preferences  JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Generated images table
CREATE TABLE generated_images (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT NOT NULL,
  prompt      TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  model       TEXT DEFAULT 'dall-e-3',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see their own data
CREATE POLICY "Users see own conversations"    ON conversations    FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "Users see own messages"         ON messages         FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "Users see own profile"          ON user_profiles    FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "Users see own images"           ON generated_images FOR ALL USING (user_id = auth.uid()::text);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_user_id      ON messages(user_id);
