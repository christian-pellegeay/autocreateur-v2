/*
  # Create tools table

  1. New Tables
    - `tools`
      - `id` (text, primary key)
      - `name` (text, not null)
      - `description` (text, not null)
      - `ticket_cost` (integer, not null, default 0)
      - `url` (text)
      - `is_affiliate` (boolean, not null, default false)
      - `promo_code` (text)
      - `icon_name` (text, not null)
      - `category` (text, not null)
      - `model` (text)
      - `system_prompt` (text)
      - `use_api` (boolean, not null, default false)
      - `created_at` (timestamptz, not null, default now())
      - `updated_at` (timestamptz, not null, default now())

  2. Security
    - Enable RLS on `tools` table
    - Add policy for authenticated users to read all tools
    - Add policy for admin users to manage tools
*/

-- Create the tools table
CREATE TABLE IF NOT EXISTS tools (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  ticket_cost integer NOT NULL DEFAULT 0,
  url text,
  is_affiliate boolean NOT NULL DEFAULT false,
  promo_code text,
  icon_name text NOT NULL,
  category text NOT NULL,
  model text,
  system_prompt text,
  use_api boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to read tools
CREATE POLICY "Users can read all tools"
  ON tools
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a policy that allows only admin users to insert tools
CREATE POLICY "Admin users can insert tools"
  ON tools
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create a policy that allows only admin users to update tools
CREATE POLICY "Admin users can update tools"
  ON tools
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create a policy that allows only admin users to delete tools
CREATE POLICY "Admin users can delete tools"
  ON tools
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tools_updated_at
BEFORE UPDATE ON tools
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();