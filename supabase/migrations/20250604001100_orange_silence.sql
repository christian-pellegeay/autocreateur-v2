/*
  # Fix RLS policies and add diagnostic function
  
  1. Changes
     - Add a diagnostic function to help with debugging RLS policies
     - Ensure RLS is enabled on the tools table
     - Recreate all policies for the tools table to ensure they're properly set up
     - Add default tools if none exist
*/

-- Create a diagnostic function to help with debugging
CREATE OR REPLACE FUNCTION check_access_policies(
  schema_name text DEFAULT 'public',
  table_name text DEFAULT 'tools'
)
RETURNS TABLE (
  policy_name text,
  policy_role name,
  cmd text,
  qual text,
  with_check text
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    p.polname as policy_name,
    r.rolname as policy_role,
    CASE
      WHEN p.cmd = 'r' THEN 'SELECT'
      WHEN p.cmd = 'a' THEN 'INSERT'
      WHEN p.cmd = 'w' THEN 'UPDATE'
      WHEN p.cmd = 'd' THEN 'DELETE'
      ELSE 'ALL'
    END as cmd,
    pg_get_expr(p.qual, p.polrelid) as qual,
    pg_get_expr(p.with_check, p.polrelid) as with_check
  FROM pg_policy p
  JOIN pg_roles r ON r.oid = ANY(p.polroles)
  WHERE p.polrelid = (schema_name || '.' || table_name)::regclass;
$$;

-- Ensure RLS is enabled on the tools table
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for the tools table to ensure they're properly set up
DROP POLICY IF EXISTS "Users can read all tools" ON tools;
DROP POLICY IF EXISTS "Anonymous users can read tools" ON tools;
DROP POLICY IF EXISTS "Admin users can insert tools" ON tools;
DROP POLICY IF EXISTS "Admin users can update tools" ON tools;
DROP POLICY IF EXISTS "Admin users can delete tools" ON tools;

-- Create a policy that allows all authenticated users to read tools
CREATE POLICY "Users can read all tools"
  ON tools
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a policy that allows anonymous users to read tools
CREATE POLICY "Anonymous users can read tools"
  ON tools
  FOR SELECT
  TO anon
  USING (true);

-- Create a policy that allows only admin users to insert tools
CREATE POLICY "Admin users can insert tools"
  ON tools
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Create a policy that allows only admin users to update tools
CREATE POLICY "Admin users can update tools"
  ON tools
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Create a policy that allows only admin users to delete tools
CREATE POLICY "Admin users can delete tools"
  ON tools
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Insert default values if no tools exist
INSERT INTO tools (id, name, description, ticket_cost, icon_name, category)
SELECT 'default-dev-tool', 'Default Dev Tool', 'This is a placeholder development tool', 0, 'Tool', 'development'
WHERE NOT EXISTS (SELECT 1 FROM tools WHERE category = 'development' LIMIT 1);

INSERT INTO tools (id, name, description, ticket_cost, icon_name, category)
SELECT 'default-mkt-tool', 'Default Marketing Tool', 'This is a placeholder marketing tool', 0, 'Tool', 'marketing'
WHERE NOT EXISTS (SELECT 1 FROM tools WHERE category = 'marketing' LIMIT 1);