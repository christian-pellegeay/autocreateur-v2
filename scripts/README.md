# Scripts Autocreateur

Ce répertoire contient les scripts utilitaires pour l'application Autocreateur.

## Scripts disponibles

### backup.js
Crée une sauvegarde complète de l'application au format ZIP.

**Usage:**
```bash
npm run backup
```

**Fonctionnalités:**
- Sauvegarde tous les fichiers sources importants
- Exclut automatiquement les dossiers temporaires (node_modules, dist, etc.)
- Génère un nom de fichier avec timestamp
- Inclut un fichier README dans l'archive
- Affiche des statistiques sur la sauvegarde

**Sortie:**
- Les sauvegardes sont créées dans le répertoire `backups/`
- Format de nom: `autocreateur-backup-YYYY-MM-DD_HH-MM-SS.zip`

**Fichiers exclus:**
- node_modules/
- dist/ et build/
- .git/
- Fichiers de logs
- Variables d'environnement locales
- Cache et fichiers temporaires

## Ajouter un nouveau script

Pour ajouter un nouveau script utilitaire :

1. Créer le fichier dans ce répertoire
2. Ajouter la commande dans `package.json` sous `scripts`
3. Documenter le script dans ce README
4. Tester le script avant de le committer

## Conventions

- Utiliser Node.js pour les scripts cross-platform
- Inclure une aide/documentation dans chaque script
- Gérer proprement les erreurs
- Afficher des messages informatifs pour l'utilisateur