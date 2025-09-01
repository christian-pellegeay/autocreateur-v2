/*
  # Create purchases table

  1. New Tables
    - `purchases`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, not null, references auth.users)
      - `package_id` (text, not null, references ticket_packages)
      - `amount` (integer, not null)
      - `price` (numeric, not null)
      - `created_at` (timestamptz, not null, default now())

  2. Security
    - Enable RLS on `purchases` table
    - Add policy for users to read their own purchases
    - Add policy for users to insert their own purchases
    - Add policy for admin users to read all purchases
*/

-- Create the purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users,
  package_id text NOT NULL REFERENCES ticket_packages,
  amount integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read their own purchases
CREATE POLICY "Users can read their own purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a policy that allows users to insert their own purchases
CREATE POLICY "Users can insert their own purchases"
  ON purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows admin users to read all purchases
CREATE POLICY "Admins can read all purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');