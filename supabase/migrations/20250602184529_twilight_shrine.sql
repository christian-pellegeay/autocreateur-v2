/*
  # Create app_configuration table

  1. New Tables
    - `app_configuration`
      - `key` (text, primary key)
      - `value` (text, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `app_configuration` table
    - Add policy for admins to read and update configuration
*/

CREATE TABLE IF NOT EXISTS app_configuration (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE app_configuration ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows admin users to read configuration
CREATE POLICY "Admin users can read configuration"
  ON app_configuration
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create a policy that allows admin users to insert configuration
CREATE POLICY "Admin users can insert configuration"
  ON app_configuration
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create a policy that allows admin users to update configuration
CREATE POLICY "Admin users can update configuration"
  ON app_configuration
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Add a trigger to update the updated_at timestamp
CREATE TRIGGER update_app_configuration_updated_at
BEFORE UPDATE ON app_configuration
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert initial configuration
INSERT INTO app_configuration (key, value)
VALUES ('lowTicketThreshold', '10');