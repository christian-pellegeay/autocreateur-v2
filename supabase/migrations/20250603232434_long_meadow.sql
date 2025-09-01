/*
  # Ajout d'une politique RLS pour l'insertion des profils utilisateurs

  1. Changements
    - Ajout d'une politique RLS permettant aux utilisateurs authentifiés d'insérer leur propre profil
    - Cette politique corrige le problème d'inscription où les utilisateurs ne peuvent pas créer leur profil

  2. Sécurité
    - La politique vérifie que l'ID dans le profil correspond à l'utilisateur authentifié
    - Cela garantit que les utilisateurs ne peuvent créer que leur propre profil
*/

-- Créer une politique qui permet aux utilisateurs de créer leur propre profil
CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);