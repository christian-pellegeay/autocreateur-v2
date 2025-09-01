/*
  # Fix tools access policies

  This migration addresses potential issues with RLS policies on the tools table that may
  be preventing proper access to tool data.
*/

-- Create a simplified diagnostic function to help with debugging
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
    p.polname::text as policy_name,
    'authenticated'::name as policy_role,
    CASE
      WHEN p.polcmd = 'r' THEN 'SELECT'
      WHEN p.polcmd = 'a' THEN 'INSERT'
      WHEN p.polcmd = 'w' THEN 'UPDATE'
      WHEN p.polcmd = 'd' THEN 'DELETE'
      ELSE 'ALL'
    END::text as cmd,
    COALESCE(pg_get_expr(p.polqual, p.polrelid), 'N/A')::text as qual,
    COALESCE(pg_get_expr(p.polwithcheck, p.polrelid), 'N/A')::text as with_check
  FROM pg_policy p
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