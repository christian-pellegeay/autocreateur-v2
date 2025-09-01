const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Configuration de la sauvegarde
const projectRoot = path.resolve(__dirname, '..');
const backupDir = path.join(projectRoot, 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                 new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
const backupFileName = `autocreateur-backup-${timestamp}.zip`;
const backupPath = path.join(backupDir, backupFileName);

// Fichiers et dossiers à exclure de la sauvegarde
const excludePatterns = [
  'node_modules',
  'dist',
  'build', 
  '.git',
  '.vscode',
  '.idea',
  'backups',
  '*.log',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  '.DS_Store',
  'Thumbs.db',
  '.env.local',
  '.env.development.local',
  '.env.test.local',
  '.env.production.local',
  'coverage',
  '.nyc_output'
];

// Fonction pour vérifier si un fichier/dossier doit être exclu
function shouldExclude(filePath) {
  const relativePath = path.relative(projectRoot, filePath);
  
  return excludePatterns.some(pattern => {
    if (pattern.includes('*')) {
      // Support des wildcards simples
      const regexPattern = pattern.replace(/\*/g, '.*');
      return new RegExp(regexPattern).test(relativePath);
    }
    
    // Vérifier si c'est un chemin exact ou si le chemin commence par le pattern
    return relativePath === pattern || 
           relativePath.startsWith(pattern + path.sep) ||
           path.basename(relativePath) === pattern;
  });
}

// Créer le répertoire de sauvegarde s'il n'existe pas
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log('🚀 Début de la création de la sauvegarde...');
console.log(`📁 Répertoire source: ${projectRoot}`);
console.log(`💾 Fichier de sauvegarde: ${backupPath}`);

// Créer l'archive ZIP
const output = fs.createWriteStream(backupPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Compression maximale
});

// Gestion des événements
output.on('close', function() {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✅ Sauvegarde créée avec succès !`);
  console.log(`📊 Taille de l'archive: ${sizeInMB} MB (${archive.pointer()} bytes)`);
  console.log(`📍 Emplacement: ${backupPath}`);
});

output.on('end', function() {
  console.log('Archive finalisée');
});

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('⚠️  Avertissement:', err.message);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  console.error('❌ Erreur lors de la création de l\'archive:', err);
  )
  throw err;
});

// Connecter l'archive au flux de sortie
archive.pipe(output);

// Fonction récursive pour ajouter des fichiers à l'archive
function addToArchive(dirPath, archivePath = '') {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item.name);
    const archiveItemPath = path.join(archivePath, item.name).replace(/\\/g, '/');
    
    if (shouldExclude(fullPath)) {
      console.log(`⏭️  Exclusion: ${path.relative(projectRoot, fullPath)}`);
      return;
    }
    
    if (item.isDirectory()) {
      // Ajouter le répertoire et traiter récursivement son contenu
      addToArchive(fullPath, archiveItemPath);
    } else if (item.isFile()) {
      // Ajouter le fichier à l'archive
      const relativePath = path.relative(projectRoot, fullPath);
      console.log(`📄 Ajout: ${relativePath}`);
      archive.file(fullPath, { name: archiveItemPath });
    }
  });
}

// Créer un fichier README pour la sauvegarde
const readmeContent = `# Sauvegarde Autocreateur

Date de création: ${new Date().toLocaleString('fr-FR')}
Version: 1.0.0

## Contenu de la sauvegarde

Cette archive contient une sauvegarde complète de l'application Autocreateur, incluant :

- Code source de l'application React/TypeScript
- Configuration Vite et outils de développement
- Configuration Tailwind CSS
- Migrations et fonctions Supabase
- Documentation et fichiers de projet

## Fichiers exclus

Les éléments suivants ont été exclus de la sauvegarde :
- node_modules/ (dépendances npm)
- dist/ et build/ (fichiers compilés)
- .git/ (historique Git)
- Fichiers de logs
- Variables d'environnement locales

## Restauration

Pour restaurer cette sauvegarde :
1. Extraire l'archive dans un nouveau répertoire
2. Exécuter \`npm install\` pour réinstaller les dépendances
3. Configurer les variables d'environnement (.env)
4. Exécuter \`npm run dev\` pour lancer l'application

## Structure du projet

- src/ : Code source de l'application
- public/ : Fichiers statiques
- supabase/ : Migrations et fonctions Edge
- scripts/ : Scripts utilitaires

Créé par le script de sauvegarde automatique.
`;

// Ajouter le fichier README à l'archive
archive.append(readmeContent, { name: 'BACKUP_README.md' });

// Commencer la sauvegarde
console.log('📋 Analyse des fichiers à sauvegarder...');
addToArchive(projectRoot);

// Finaliser l'archive
archive.finalize();

// Afficher les informations de fin
setTimeout(() => {
  console.log('\n📋 Résumé de la sauvegarde:');
  console.log(`   - Nom: ${backupFileName}`);
  console.log(`   - Répertoire: ${backupDir}`);
  console.log(`   - Timestamp: ${timestamp}`);
  console.log('\n💡 Conseil: Conservez cette sauvegarde dans un endroit sûr !');
}, 1000);