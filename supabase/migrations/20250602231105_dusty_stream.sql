/*
  # Allow anonymous users to read tools

  1. Changes
     - Add RLS policy to let anonymous users view all tools
     - This allows non-logged-in visitors to browse all available tools

  2. Security
     - Anonymous users can only read tools (SELECT), not modify them
     - This maintains security while improving user experience
*/

-- Create a new policy to allow anonymous users to read tools
CREATE POLICY "Anonymous users can read tools"
  ON tools
  FOR SELECT
  TO anon
  USING (true);