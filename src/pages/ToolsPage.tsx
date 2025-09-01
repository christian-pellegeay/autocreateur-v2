import React, { useState, useEffect } from 'react';
import { useTools } from '../context/ToolsContext';
import ToolCard from '../components/ToolCard';
import { X } from 'lucide-react';

const ToolsPage: React.FC = () => {
  const { developmentTools, marketingTools, isLoading, error } = useTools();
  const [activeCategory, setActiveCategory] = useState<'development' | 'marketing'>('development');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Obtenir les outils en fonction de la catégorie active
  const tools = activeCategory === 'development' ? developmentTools : marketingTools;

  // Faire défiler vers le haut quand on change de catégorie
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeCategory]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des outils...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Nos outils</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Autocréateur permet à tout le monde de créer des sites internet, des tunnels de vente, 
          des formations, des webinaires, sans compétences techniques particulières, sans connaître 
          les langages informatiques, avec le meilleur rapport qualité/prix.
        </p>
      </div>
      
      {error && (
        <div className="mb-8 p-4 bg-red-50 rounded-lg">
          <p className="text-red-800">{error}</p>
          <p className="text-red-600 mt-2">Veuillez actualiser la page ou contacter l'administrateur du site.</p>
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-full ${
              activeCategory === 'development' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveCategory('development')}
          >
            Outils de développement
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              activeCategory === 'marketing' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveCategory('marketing')}
          >
            Outils de Marketing
          </button>
        </div>
      </div>
      
      {/* Description de la catégorie */}
      {activeCategory === 'development' && (
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-3">Outils de développement</h2>
          <p className="text-gray-700">
            Créez facilement des sites internet performants, des tunnels de vente, 
            des formations et des webinaires. Tous nos outils sont sans engagement de durée 
            et accessibles via des liens d'affiliation, sans surcoût pour vous. 
            Certains outils bénéficient de gratuités supplémentaires ou de codes de réduction exclusifs.
          </p>
        </div>
      )}
      
      {activeCategory === 'marketing' && (
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-3">Outils de Marketing</h2>
          <p className="text-gray-700 mb-4">
            Voici les outils idéaux pour créer tout le marketing dont vous avez besoin à partir des 
            vidéos YouTube des chaînes que vous aurez sélectionnés et du clone IA de votre choix. 
            Pas besoin d'avoir un compte ChatGPT Premium, pas besoin d'acheter des droits d'utilisation sur ChatGPT. 
            Vous ne payez que ce que vous avez budgétisé, en rechargeant votre compte d'un nombre de tickets 
            de votre choix et vous les utilisez comme bon vous semble. 
            L'accès aux outils payants se fait sur login/password et gestion d'un nombre de tickets.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-secondary"
          >
            Mode d'emploi
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
      
      {tools.length === 0 && !error && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-xl">
            Aucun outil disponible dans cette catégorie.
          </p>
        </div>
      )}
      
      {/* Modal pour le mode d'emploi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Mode d'emploi</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recherche, sélection et création de fichiers de scripts</h3>
              <p className="mb-4">
                Pour obtenir un résultat efficace, il faut rechercher et sélectionner des vidéos sur YouTube avec l'extension Chrome Instant Data Scraper. 
                Voici les étapes à suivre :
              </p>
              <ol className="list-decimal pl-6 mb-6 space-y-2">
                <li>Choisissez des mots clés pour la recherche des vidéos sur votre sujet dans YouTube. Vous pouvez demander à ChatGPT en mode gratuit de vous donner une liste de mots clés les plus utilisés dans votre thème.</li>
                <li>Chargez l'extension Chrome Instant Data Scraper.</li>
                <li>Allez sur YouTube et recherchez des vidéos à partir des mots clés.</li>
                <li>Pour chaque vidéo proposée, consultez le descriptif pour voir si la chaîne est spécialisée dans votre sujet.</li>
                <li>Vérifiez le nombre d'abonnés et de vues pour évaluer la qualité de la chaîne.</li>
                <li>Si la chaîne est pertinente, visitez-la et affichez ses vidéos.</li>
                <li>Utilisez l'extension Instant Data Scraper pour extraire les données et téléchargez-les en format XLSX.</li>
                <li>Le fichier contient 6 colonnes : gardez uniquement l'URL des vidéos, la durée et le titre (supprimez les colonnes 6, 5 et 2).</li>
              </ol>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="italic text-blue-700">
                  Note : Pour avoir des informations pertinentes, évitez les vidéos de plus de 2 ans. 
                  Il est recommandé d'avoir au minimum 3 vidéos par chaîne YouTube et au moins 3 chaînes différentes. 
                  Pour créer une formation complète, plus vous aurez de sources, meilleure sera votre formation. 
                  Pour la publicité, une dizaine de vidéos sur le sujet peuvent suffire.
                </p>
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Validation des vidéos stockées dans un fichier .xlsx</h3>
              <p className="mb-4">
                Cet outil vous permet de traiter et valider les vidéos que vous avez sélectionnées :
              </p>
              <ol className="list-decimal pl-6 mb-6 space-y-2">
                <li>Sélectionnez le fichier .xlsx obtenu précédemment (avec 3 colonnes : URL, durée, titre).</li>
                <li>Pour chaque vidéo, vous verrez son titre, sa durée et trois boutons :</li>
                <li>Le bouton "Lire la Vidéo" ouvre la vidéo dans YouTube. Vous pouvez alors vérifier si elle correspond à votre recherche et accéder à sa transcription.</li>
                <li>Le bouton "Conserver la vidéo" ou "Vidéo suivante" vous permet de passer à la vidéo suivante.</li>
                <li>Le bouton "Supprimer la vidéo" supprime la ligne correspondante dans le fichier XLSX.</li>
                <li>À la fin du traitement, vous pourrez télécharger le fichier résultant, traiter un nouveau fichier ou revenir à la page de choix des outils.</li>
              </ol>
              
              <h3 className="text-lg font-semibold mb-4">Concaténation de deux fichiers .docx</h3>
              <p className="mb-4">
                Cet outil vous permet de fusionner deux fichiers DOCX en un seul :
              </p>
              <ol className="list-decimal pl-6 mb-6 space-y-2">
                <li>Sélectionnez les deux fichiers .docx que vous souhaitez fusionner.</li>
                <li>Cliquez sur "Fusionner les fichiers" (ce bouton n'est actif que lorsque les deux fichiers sont sélectionnés).</li>
                <li>Une fois les fichiers fusionnés, vous pourrez télécharger le nouveau fichier .docx.</li>
                <li>Vous aurez également la possibilité de traiter deux nouveaux fichiers ou de revenir à la page des outils.</li>
              </ol>
              
              <h3 className="text-lg font-semibold mb-4">Les outils IA spécialisés</h3>
              <p className="mb-6">
                Nos outils IA vous aident à créer divers contenus sans avoir besoin d'un compte ChatGPT Premium :
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Clone IA pour votre stratégie</h4>
                  <p>
                    Ce GPT développe une stratégie de développement détaillée et personnalisée, étape par étape.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Générateur de script de podcasts</h4>
                  <p>
                    Crée des scripts optimisés pour maintenir l'attention des auditeurs avec des informations claires et accessibles.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Générateur de Lead Magnet</h4>
                  <p>
                    Vous guide dans la création de lead magnets percutants pour capturer efficacement des emails.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Générateur de Posts et d'emails</h4>
                  <p>
                    Crée des contenus marketing automatisés pour vos emails de vente et publications sur les réseaux sociaux.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Générateur de scripts de vidéos</h4>
                  <p>
                    Développe des scripts captivants pour vos vidéos YouTube, qu'elles soient longues ou courtes.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Création de 50 idées de scripts vidéos</h4>
                  <p>
                    Fournit 50 idées de scripts avec des mots-clés de recherche pour vos vidéos YouTube.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Générateur de formation</h4>
                  <p>
                    Vous accompagne dans la création d'une formation en un ou plusieurs modules sur le sujet de votre choix.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsPage;