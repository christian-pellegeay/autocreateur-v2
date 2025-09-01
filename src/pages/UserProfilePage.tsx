import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, MapPin, Ticket } from 'lucide-react';
import { supabase } from '../supabase/client';

const UserProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [cumulativeTickets, setCumulativeTickets] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login', { state: { message: 'Veuillez vous connecter pour accéder à votre profil.' } });
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Set initial form values
        setName(user.name);
        setEmail(user.email);
        setAddress(user.address);

        // Fetch purchase history
        const { data: purchases, error: purchasesError } = await supabase
          .from('purchases')
          .select(`
            id,
            package_id,
            amount,
            price,
            created_at,
            ticket_packages(name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (purchasesError) {
          console.error('Error fetching purchase history:', purchasesError);
        } else {
          setPurchaseHistory(purchases);
          
          // Calculate cumulative tickets purchased
          const totalTickets = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
          setCumulativeTickets(totalTickets);
        }

        // Fetch tool usage history
        const { data: usages, error: usagesError } = await supabase
          .from('tool_usages')
          .select(`
            id,
            tool_id,
            tickets_used,
            created_at,
            tools(name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (usagesError) {
          console.error('Error fetching tool usage history:', usagesError);
        } else {
          setUsageHistory(usages);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!user) return;

    // Validate inputs
    if (!name || !email || !address) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      // Update profile in Supabase
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          full_name: name,
          address: address
        })
        .eq('id', user.id);
      
      if (profileError) {
        throw new Error(profileError.message);
      }
      
      // If email has changed, update it in auth
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        });
        
        if (emailError) {
          throw new Error(emailError.message);
        }
      }
      
      // Update local user state
      updateUser({
        ...user,
        name,
        email,
        address
      });
      
      setMessage('Profil mis à jour avec succès.');
      setIsEditing(false);
    } catch (err: any) {
      setError('Une erreur est survenue lors de la mise à jour du profil: ' + err.message);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mon profil</h1>
      
      {message && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg text-green-800">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-800">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* User info card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserIcon size={40} className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">Membre depuis {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <Mail size={18} className="text-primary mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin size={18} className="text-primary mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p>{user.address}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Ticket size={18} className="text-primary mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Tickets</p>
                  <p>{user.tickets} disponibles</p>
                  <p className="text-sm text-gray-500">{cumulativeTickets} achetés au total</p>
                </div>
              </div>
            </div>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-6 btn btn-secondary w-full"
              >
                Modifier mon profil
              </button>
            )}
          </div>
        </div>
        
        {/* Edit profile form / Activity history */}
        <div className="md:col-span-2">
          {isEditing ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Modifier mon profil</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse (pour facturation)
                  </label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input"
                    placeholder="Votre adresse complète"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Historique d'achat de tickets</h2>
                
                {purchaseHistory.length === 0 ? (
                  <p className="text-gray-500">Aucun achat de tickets pour le moment.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pack</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {purchaseHistory.map((purchase) => (
                          <tr key={purchase.id}>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {new Date(purchase.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {purchase.ticket_packages?.name || purchase.package_id}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {purchase.amount}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {parseFloat(purchase.price).toFixed(2)} €
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Historique d'utilisation des outils</h2>
                
                {usageHistory.length === 0 ? (
                  <p className="text-gray-500">Aucune utilisation d'outil pour le moment.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outil</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets utilisés</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {usageHistory.map((usage) => (
                          <tr key={usage.id}>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {new Date(usage.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {usage.tools?.name || usage.tool_id}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {usage.tickets_used}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;