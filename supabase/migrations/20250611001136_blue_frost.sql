/*
  # Fix tools access policies

  This migration addresses potential issues with RLS policies on the tools table that may
  be preventing proper access to tool data.
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
    p.polname::text as policy_name,
    'authenticated'::name as policy_role,
    'SELECT'::text as cmd,
    pg_get_expr(p.qual, p.polrelid)::text as qual,
    pg_get_expr(p.with_check, p.polrelid)::text as with_check
  FROM pg_policy p
  WHERE p.polrelid = (schema_name || '.' || table_name)::regclass;
$$;

-- Make sure RLS is enabled on the tools table
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies for the tools table to avoid conflicts
DROP POLICY IF EXISTS "Users can read all tools" ON public.tools;
DROP POLICY IF EXISTS "Anonymous users can read tools" ON public.tools;
DROP POLICY IF EXISTS "Admin users can insert tools" ON public.tools;
DROP POLICY IF EXISTS "Admin users can update tools" ON public.tools;
DROP POLICY IF EXISTS "Admin users can delete tools" ON public.tools;

-- Create fresh policies with proper access control
-- Create a policy that allows all authenticated users to read tools
CREATE POLICY "Users can read all tools"
  ON public.tools
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a policy that allows anonymous users to read tools
CREATE POLICY "Anonymous users can read tools"
  ON public.tools
  FOR SELECT
  TO anon
  USING (true);

-- Create a policy that allows only admin users to insert tools
CREATE POLICY "Admin users can insert tools"
  ON public.tools
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Create a policy that allows only admin users to update tools
CREATE POLICY "Admin users can update tools"
  ON public.tools
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Create a policy that allows only admin users to delete tools
CREATE POLICY "Admin users can delete tools"
  ON public.tools
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Make sure there's at least one default tool in each category
INSERT INTO public.tools (id, name, description, ticket_cost, icon_name, category)
SELECT 'default-dev-tool', 'Default Dev Tool', 'This is a placeholder development tool', 0, 'Tool', 'development'
WHERE NOT EXISTS (SELECT 1 FROM public.tools WHERE category = 'development' LIMIT 1);

INSERT INTO public.tools (id, name, description, ticket_cost, icon_name, category)
SELECT 'default-mkt-tool', 'Default Marketing Tool', 'This is a placeholder marketing tool', 0, 'Tool', 'marketing'
WHERE NOT EXISTS (SELECT 1 FROM public.tools WHERE category = 'marketing' LIMIT 1);