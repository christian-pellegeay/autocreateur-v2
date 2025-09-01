import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { concatenateDocxFiles } from '../../utils/fileProcessors';

const DocxConcatenator: React.FC = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const handleFile1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.docx')) {
        setError('Veuillez sélectionner un fichier DOCX.');
        return;
      }
      setFile1(selectedFile);
      setError('');
    }
  };
  
  const handleFile2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.docx')) {
        setError('Veuillez sélectionner un fichier DOCX.');
        return;
      }
      setFile2(selectedFile);
      setError('');
    }
  };
  
  const handleMergeFiles = async () => {
    if (!file1 || !file2) {
      setError('Veuillez sélectionner deux fichiers DOCX.');
      return;
    }
    
    try {
      setLoading(true);
      const mergedBlob = await concatenateDocxFiles(file1, file2);
      
      // Create download link
      const url = URL.createObjectURL(mergedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file1.name.split('.')[0]}_${file2.name.split('.')[0]}_merged.docx`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Les fichiers ont été fusionnés avec succès.');
    } catch (err) {
      setError('Erreur lors de la fusion des fichiers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setFile1(null);
    setFile2(null);
    setSuccess('');
    setError('');
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Concaténation de fichiers DOCX</h2>
        
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
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFile1Change}
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
                  {file1 ? file1.name : 'Sélectionner le premier fichier DOCX'}
                </span>
              </label>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFile2Change}
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
                  {file2 ? file2.name : 'Sélectionner le second fichier DOCX'}
                </span>
              </label>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <button
              onClick={handleMergeFiles}
              disabled={!file1 || !file2 || !user || loading}
              className="btn btn-primary"
            >
              {loading ? 'Fusion en cours...' : 'Fusionner les fichiers'}
            </button>
            
            <button
              onClick={handleReset}
              className="btn btn-secondary"
              disabled={loading}
            >
              Réinitialiser
            </button>
            
            <button
              onClick={() => window.location.href = '/tools'}
              className="btn bg-gray-600 text-white hover:bg-gray-700"
              disabled={loading}
            >
              Retour aux outils
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Information :</h3>
            <p className="text-blue-700">
              Cet outil vous permet de fusionner deux fichiers DOCX en un seul document.
              Le contenu du premier fichier sera suivi du contenu du second fichier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocxConcatenator;