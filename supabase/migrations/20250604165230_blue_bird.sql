/*
  # Ajout d'un champ mode d'emploi aux outils

  1. Changements
    - Ajout d'une colonne `usage_instructions` de type text à la table `tools`
    - Cette colonne permettra de stocker des instructions d'utilisation détaillées pour chaque outil
    - Particulièrement utile pour les outils de marketing qui nécessitent des explications spécifiques

  2. Impact
    - Les outils de marketing pourront afficher un mode d'emploi détaillé
    - Améliore l'expérience utilisateur en fournissant des instructions claires
*/

-- Ajouter la colonne usage_instructions à la table tools
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS usage_instructions text;

-- Mettre à jour les outils de marketing existants avec des instructions d'utilisation par défaut
UPDATE tools
SET usage_instructions = 'Pour utiliser cet outil efficacement, suivez les instructions à l''écran et fournissez les informations demandées.'
WHERE category = 'marketing' AND usage_instructions IS NULL;