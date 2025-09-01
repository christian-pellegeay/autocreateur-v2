import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { processVideoFile, saveVideoDataToXLSX } from '../../utils/fileProcessors';

const VideoValidator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoData, setVideoData] = useState<any[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx')) {
        setError('Veuillez sélectionner un fichier XLSX.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };
  
  const handleProcessFile = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier.');
      return;
    }
    
    try {
      setLoading(true);
      const data = await processVideoFile(file);
      setVideoData(data);
      setCurrentIndex(0);
      setSuccess('Fichier chargé avec succès.');
    } catch (err) {
      setError('Erreur lors du traitement du fichier. Assurez-vous que le format est correct.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleWatchVideo = (url: string) => {
    window.open(url, '_blank');
  };
  
  const handleKeepVideo = () => {
    if (videoData && currentIndex < videoData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handleDeleteVideo = () => {
    if (videoData) {
      const updatedData = [...videoData];
      updatedData.splice(currentIndex, 1);
      setVideoData(updatedData);
      
      // If we deleted the last video, go back one
      if (currentIndex >= updatedData.length) {
        setCurrentIndex(Math.max(0, updatedData.length - 1));
      }
    }
  };
  
  const handleDownloadResult = () => {
    if (videoData) {
      const blob = saveVideoDataToXLSX(videoData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'videos_validés.xlsx';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setVideoData(null);
    setCurrentIndex(0);
    setSuccess('');
    setError('');
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Validation des vidéos</h2>
        
        {!user && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg text-yellow-800">
            Vous devez être connecté pour utiliser cet outil.
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg text-red-800">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg text-green-800">
            {success}
          </div>
        )}
        
        {!videoData ? (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={!user || loading}
                />
                <div className="mb-3">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <span className="text-gray-600">
                  {file ? file.name : 'Cliquez pour sélectionner un fichier XLSX'}
                </span>
              </label>
            </div>
            
            <div className="mt-4">
              <button
                onClick={handleProcessFile}
                disabled={!file || !user || loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Traitement en cours...' : 'Traiter le fichier'}
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Format attendu :</h3>
              <p className="text-blue-700">
                Le fichier XLSX doit contenir 3 colonnes : URL de la vidéo, Durée, et Titre.
              </p>
            </div>
          </div>
        ) : videoData.length > 0 ? (
          <div>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">
                  Vidéo {currentIndex + 1} sur {videoData.length}
                </h3>
                <span className="text-gray-500">
                  Durée : {videoData[currentIndex].duration}
                </span>
              </div>
              
              <h4 className="text-xl font-medium mb-4">
                {videoData[currentIndex].title}
              </h4>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={() => handleWatchVideo(videoData[currentIndex].url)}
                  className="flex-1 btn bg-blue-600 text-white hover:bg-blue-700"
                >
                  Lire la vidéo
                </button>
                <button
                  onClick={handleKeepVideo}
                  className="flex-1 btn bg-green-600 text-white hover:bg-green-700"
                >
                  Vidéo suivante
                </button>
                <button
                  onClick={handleDeleteVideo}
                  className="flex-1 btn bg-red-600 text-white hover:bg-red-700"
                >
                  Supprimer la vidéo
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <h3 className="text-xl font-semibold mb-4">Travail terminé</h3>
            <p className="mb-6 text-gray-600">Toutes les vidéos ont été traitées.</p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleDownloadResult}
                className="btn btn-primary"
              >
                Télécharger le résultat
              </button>
              <button
                onClick={handleReset}
                className="btn btn-secondary"
              >
                Traiter un nouveau fichier
              </button>
              <button
                onClick={() => window.location.href = '/tools'}
                className="btn bg-gray-600 text-white hover:bg-gray-700"
              >
                Retour aux outils
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoValidator;