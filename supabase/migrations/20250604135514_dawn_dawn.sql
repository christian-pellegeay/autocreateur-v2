DO $$
BEGIN

-- Créer ou remplacer une fonction de diagnostic pour aider au débogage
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

-- S'assurer que la sécurité au niveau des lignes (RLS) est activée sur la table tools
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour la table tools afin d'éviter les conflits
DROP POLICY IF EXISTS "Users can read all tools" ON tools;
DROP POLICY IF EXISTS "Anonymous users can read tools" ON tools;
DROP POLICY IF EXISTS "Admin users can insert tools" ON tools;
DROP POLICY IF EXISTS "Admin users can update tools" ON tools;
DROP POLICY IF EXISTS "Admin users can delete tools" ON tools;

-- Créer les politiques pour la table tools
-- Politique pour permettre à tous les utilisateurs authentifiés de lire les outils
CREATE POLICY "Users can read all tools"
  ON tools
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour permettre aux utilisateurs anonymes de lire les outils
CREATE POLICY "Anonymous users can read tools"
  ON tools
  FOR SELECT
  TO anon
  USING (true);

-- Politique pour permettre uniquement aux administrateurs d'insérer des outils
CREATE POLICY "Admin users can insert tools"
  ON tools
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Politique pour permettre uniquement aux administrateurs de mettre à jour des outils
CREATE POLICY "Admin users can update tools"
  ON tools
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Politique pour permettre uniquement aux administrateurs de supprimer des outils
CREATE POLICY "Admin users can delete tools"
  ON tools
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Insérer des valeurs par défaut si aucun outil n'existe dans chaque catégorie
INSERT INTO tools (id, name, description, ticket_cost, icon_name, category)
SELECT 'default-dev-tool', 'Default Dev Tool', 'This is a placeholder development tool', 0, 'Tool', 'development'
WHERE NOT EXISTS (SELECT 1 FROM tools WHERE category = 'development' LIMIT 1);

INSERT INTO tools (id, name, description, ticket_cost, icon_name, category)
SELECT 'default-mkt-tool', 'Default Marketing Tool', 'This is a placeholder marketing tool', 0, 'Tool', 'marketing'
WHERE NOT EXISTS (SELECT 1 FROM tools WHERE category = 'marketing' LIMIT 1);

END $$;