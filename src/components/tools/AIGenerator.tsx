import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../context/ToolsContext';
import { AIMessage, Tool } from '../../types';
import { Send, Loader2, Upload, X, FileText } from 'lucide-react';
import { supabase } from '../../supabase/client';

const AIGenerator: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const { user } = useAuth();
  const { developmentTools, marketingTools } = useTools();
  const navigate = useNavigate();
  
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // États pour la gestion des fichiers
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
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
    
    // Si l'outil a un prompt système, l'ajouter aux messages
    if (foundTool.systemPrompt) {
      setMessages([{ role: 'system', content: foundTool.systemPrompt }]);
    }
    
    setLoading(false);
  }, [toolId, developmentTools, marketingTools]);

  const handleOpenExternalGPT = () => {
    if (tool?.url) {
      window.open(tool.url, '_blank');
    }
  };

  // Gérer le changement de fichier sélectionné
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    setSelectedFile(file);
    
    // Lire le contenu du fichier
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      // Vérifier si c'est un fichier DOCX
      if (file.name.endsWith('.docx')) {
        setFileError('Les fichiers DOCX ne sont pas pris en charge directement. Veuillez convertir votre fichier en texte brut.');
        return;
      }
      
      setUploadedFileContent(content);
    };
    
    reader.onerror = () => {
      setFileError('Erreur lors de la lecture du fichier.');
    };
    
    // Pour les fichiers texte
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      // Pour les autres types de fichiers, on peut afficher une erreur
      setFileError(`Le type de fichier ${file.type} n'est pas pris en charge. Utilisez des fichiers texte.`);
    }
  };

  // Effacer le fichier sélectionné
  const clearSelectedFile = () => {
    setSelectedFile(null);
    setUploadedFileContent(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendPrompt = async () => {
    if (!prompt.trim() || !tool || isGenerating) return;
    
    let finalPrompt = prompt;
    
    // Si un fichier a été chargé, l'inclure dans le prompt
    if (uploadedFileContent) {
      finalPrompt = `Contenu du fichier "${selectedFile?.name}":\n\n${uploadedFileContent}\n\n${prompt}`;
    }
    
    // Ajouter le message de l'utilisateur
    const updatedMessages = [...messages, { role: 'user', content: finalPrompt }];
    setMessages(updatedMessages);
    setPrompt('');
    setIsGenerating(true);
    setApiError('');
    
    // Réinitialiser le fichier après l'envoi
    clearSelectedFile();
    
    try {
      // Use the Supabase function URL directly
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-chat`;
      
      // Call the function with a simple fetch to avoid CORS issues with x-client-info header
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: tool.model || 'gpt-3.5-turbo',
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.content) {
        throw new Error('Réponse invalide de l\'API');
      }
      
      // Ajouter la réponse de l'assistant
      setMessages([...updatedMessages, { role: 'assistant', content: data.content }]);
    } catch (err: any) {
      console.error('Erreur OpenAI:', err);
      setApiError(`Erreur: ${err.message}`);
    } finally {
      setIsGenerating(false);
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">{tool.name}</h2>
          <p className="text-gray-600 mt-2">{tool.description}</p>
          
          {/* Afficher les instructions d'utilisation pour les outils de marketing si elles existent */}
          {tool.category === 'marketing' && tool.usageInstructions && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium mb-2">Mode d'emploi :</p>
              <p className="text-blue-700 whitespace-pre-line">{tool.usageInstructions}</p>
            </div>
          )}
          
          {!user && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-yellow-800">
              Vous devez être connecté pour utiliser cet outil.
            </div>
          )}
          
          {apiError && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-800">
              {apiError}
            </div>
          )}
          
          {tool.ticketCost > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <span className="font-medium">Coût:</span> {tool.ticketCost} ticket{tool.ticketCost > 1 ? 's' : ''}
              </p>
            </div>
          )}
          
          {tool.url && !tool.useAPI && (
            <div className="mt-4">
              <button
                onClick={handleOpenExternalGPT}
                className="btn btn-primary"
                disabled={!user}
              >
                Ouvrir l'outil externe
              </button>
            </div>
          )}
        </div>
        
        {/* Conversation */}
        {tool.useAPI && (
          <div className="flex flex-col h-[60vh]">
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {/* Messages */}
              {messages.filter(msg => msg.role !== 'system').map((msg, index) => (
                <div
                  key={index}
                  className={`max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'ml-auto bg-primary text-white' 
                      : 'mr-auto bg-gray-100 text-gray-800'
                  } p-4 rounded-lg`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              
              {isGenerating && (
                <div className="mr-auto bg-gray-100 text-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>L'IA génère une réponse...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* File upload section */}
            <div className="border-t p-4">
              {selectedFile ? (
                <div className="mb-3 p-2 bg-blue-50 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm text-blue-700">{selectedFile.name}</span>
                  </div>
                  <button 
                    onClick={clearSelectedFile}
                    className="p-1 rounded-full hover:bg-blue-100"
                  >
                    <X className="h-4 w-4 text-blue-500" />
                  </button>
                </div>
              ) : (
                <div className="mb-3">
                  <label 
                    htmlFor="file-upload" 
                    className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-primary"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    <span>Télécharger un fichier de référence</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".txt,.md,.text/plain"
                    disabled={!user || isGenerating}
                  />
                </div>
              )}
              
              {fileError && (
                <div className="mb-3 p-2 bg-red-50 rounded-md text-sm text-red-700">
                  {fileError}
                </div>
              )}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt();
                    }
                  }}
                  placeholder="Entrez votre message..."
                  className="flex-grow input"
                  disabled={!user || isGenerating}
                />
                <button
                  onClick={handleSendPrompt}
                  className="btn btn-primary"
                  disabled={!user || isGenerating || !prompt.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
              
              {messages.length === 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Décrivez votre besoin en détail pour obtenir les meilleurs résultats.
                    {uploadedFileContent && selectedFile ? (
                      <span> Le contenu du fichier "{selectedFile.name}\" sera inclus dans votre demande.</span>
                    ) : (
                      <span> Vous pouvez également télécharger un fichier texte pour fournir plus de contexte.</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => navigate('/tools')}
          className="btn bg-gray-600 text-white hover:bg-gray-700"
        >
          Retour aux outils
        </button>
      </div>
    </div>
  );
};

export default AIGenerator;