/*
  # Create tool usages table

  1. New Tables
    - `tool_usages`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, not null, references auth.users)
      - `tool_id` (text, not null, references tools)
      - `tickets_used` (integer, not null)
      - `created_at` (timestamptz, not null, default now())

  2. Security
    - Enable RLS on `tool_usages` table
    - Add policy for users to read their own usage data
    - Add policy for users to insert their own usage data
    - Add policy for admin users to read all usage data
*/

-- Create the tool_usages table
CREATE TABLE IF NOT EXISTS tool_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users,
  tool_id text NOT NULL REFERENCES tools,
  tickets_used integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tool_usages ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read their own usage data
CREATE POLICY "Users can read their own tool usage"
  ON tool_usages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a policy that allows users to insert their own usage data
CREATE POLICY "Users can insert their own tool usage"
  ON tool_usages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows admin users to read all usage data
CREATE POLICY "Admins can read all tool usage data"
  ON tool_usages
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');