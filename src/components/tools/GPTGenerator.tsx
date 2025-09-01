import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../context/ToolsContext';

const GPTGenerator: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const { user } = useAuth();
  const { developmentTools, marketingTools } = useTools();
  const navigate = useNavigate();
  
  const [tool, setTool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!toolId) {
      setError('Outil non spécifié');
      setLoading(false);
      return;
    }
    
    const allTools = [...(developmentTools || []), ...(marketingTools || [])];
    const foundTool = allTools.find(t => t.id === toolId);
    if (!foundTool) {
      setError('Outil non trouvé');
      setLoading(false);
      return;
    }
    
    setTool(foundTool);
    setLoading(false);
  }, [toolId, developmentTools, marketingTools]);
  
  const handleOpenGPT = () => {
    if (tool?.url) {
      window.open(tool.url, '_blank');
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    );
  }
  
  if (error || !tool) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-red-600">Erreur</h2>
          <p className="mb-6">{error || 'Une erreur est survenue'}</p>
          <button
            onClick={() => navigate('/tools')}
            className="btn btn-primary"
          >
            Retour aux outils
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">{tool.name}</h2>
        
        {!user && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg text-yellow-800">
            Vous devez être connecté pour utiliser cet outil.
          </div>
        )}
        
        <div className="mb-6 p-4 rounded-lg bg-gray-50">
          <p className="text-gray-700 mb-4">{tool.description}</p>
          
          {tool.ticketCost > 0 && (
            <div className="mb-4">
              <span className="font-medium">Coût :</span> {tool.ticketCost} ticket{tool.ticketCost > 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <p className="font-medium">
            Cet outil utilise ChatGPT pour générer du contenu. Cliquez sur le bouton ci-dessous pour accéder à l'outil.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Comment utiliser cet outil :</h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-2">
              <li>Cliquez sur le bouton "Ouvrir l'outil" ci-dessous</li>
              <li>Vous serez redirigé vers ChatGPT</li>
              <li>Suivez les instructions fournies par l'assistant GPT</li>
              <li>Téléchargez ou copiez le contenu généré</li>
            </ol>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <button
              onClick={handleOpenGPT}
              disabled={!user}
              className="btn btn-primary"
            >
              Ouvrir l'outil
            </button>
            
            <button
              onClick={() => navigate('/tools')}
              className="btn bg-gray-600 text-white hover:bg-gray-700"
            >
              Retour aux outils
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPTGenerator;