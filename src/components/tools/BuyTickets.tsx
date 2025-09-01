import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../context/ToolsContext';

interface LocationState {
  message?: string;
}

const BuyTickets: React.FC = () => {
  const { user } = useAuth();
  const { ticketPackages, purchaseTickets } = useTools();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    setError('');
  };
  
  const handlePurchase = async () => {
    if (!selectedPackage) {
      setError('Veuillez sélectionner un pack de tickets.');
      return;
    }
    
    if (!user) {
      navigate('/login', { state: { from: '/buy-tickets' } });
      return;
    }
    
    try {
      setLoading(true);
      const success = await purchaseTickets(selectedPackage);
      
      if (success) {
        setSuccess('Achat réussi ! Vos tickets ont été ajoutés à votre compte.');
        setSelectedPackage(null);
      } else {
        setError('Une erreur est survenue lors de l\'achat. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Acheter des tickets</h2>
        
        {state?.message && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg text-yellow-800">
            {state.message}
          </div>
        )}
        
        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg text-yellow-800">
            Vous devez être connecté pour acheter des tickets.
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-800">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg text-green-800">
            {success}
          </div>
        )}
        
        <div className="mb-8">
          <p className="mb-4">
            Les tickets vous permettent d'utiliser nos outils de génération de contenu.
            Chaque outil nécessite un certain nombre de tickets.
          </p>
          
          {user && (
            <div className="p-4 bg-blue-50 rounded-lg text-blue-800 mb-6">
              <p className="font-medium">Vous avez actuellement {user.tickets} ticket{user.tickets !== 1 ? 's' : ''}.</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {ticketPackages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                selectedPackage === pkg.id 
                  ? 'border-primary shadow-md bg-primary/5' 
                  : 'border-gray-200 hover:border-primary/50 hover:shadow-sm'
              }`}
              onClick={() => handleSelectPackage(pkg.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{pkg.name}</h3>
                <div className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center">
                  {selectedPackage === pkg.id && (
                    <div className="h-4 w-4 rounded-full bg-primary"></div>
                  )}
                </div>
              </div>
              
              <div className="text-center mb-4">
                <span className="text-3xl font-bold">{pkg.amount}</span>
                <span className="text-gray-600 ml-2">tickets</span>
              </div>
              
              <div className="text-center">
                <span className="text-2xl font-bold">{pkg.price.toFixed(2)} €</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || !user || loading}
            className="btn btn-primary w-full md:w-auto md:px-8"
          >
            {loading ? 'Traitement...' : 'Acheter maintenant'}
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Comment fonctionnent les tickets ?</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Les tickets sont utilisés pour accéder à nos outils de génération de contenu</li>
            <li>Chaque outil a un coût spécifique en tickets</li>
            <li>Les tickets n'expirent pas</li>
            <li>Les tickets ne sont pas remboursables</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BuyTickets;