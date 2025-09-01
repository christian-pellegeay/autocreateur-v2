/*
  # Create ticket packages table

  1. New Tables
    - `ticket_packages`
      - `id` (text, primary key)
      - `name` (text, not null)
      - `amount` (integer, not null)
      - `price` (numeric, not null)
      - `created_at` (timestamptz, not null, default now())
      - `updated_at` (timestamptz, not null, default now())

  2. Security
    - Enable RLS on `ticket_packages` table
    - Add policy for all users to read packages
    - Add policy for admin users to manage packages
*/

-- Create the ticket_packages table
CREATE TABLE IF NOT EXISTS ticket_packages (
  id text PRIMARY KEY,
  name text NOT NULL,
  amount integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ticket_packages ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to read ticket packages
CREATE POLICY "Users can read all ticket packages"
  ON ticket_packages
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a policy that allows anonymous users to read ticket packages
CREATE POLICY "Anonymous users can read ticket packages"
  ON ticket_packages
  FOR SELECT
  TO anon
  USING (true);

-- Create a policy that allows only admin users to insert ticket packages
CREATE POLICY "Admin users can insert ticket packages"
  ON ticket_packages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create a policy that allows only admin users to update ticket packages
CREATE POLICY "Admin users can update ticket packages"
  ON ticket_packages
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create a policy that allows only admin users to delete ticket packages
CREATE POLICY "Admin users can delete ticket packages"
  ON ticket_packages
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Add a trigger to update the updated_at timestamp
CREATE TRIGGER update_ticket_packages_updated_at
BEFORE UPDATE ON ticket_packages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();