import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, TicketPackage, Tool } from '../types';
import { encryptApiKey, storeEncryptedApiKey } from '../utils/apiEncryption';
import * as XLSX from 'xlsx';
import { useTools } from '../context/ToolsContext';

interface AdminCredentials {
  username: string;
  password: string;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [activeToolCategory, setActiveToolCategory] = useState<'development' | 'marketing'>('development');
  
  const { 
    developmentTools, 
    marketingTools, 
    ticketPackages, 
    updateDevelopmentToolTicketCost, 
    updateMarketingToolTicketCost, 
    updateTicketPackage 
  } = useTools();
  
  // States for admin settings
  const [apiKey, setApiKey] = useState('');
  const [encryptionPhrase, setEncryptionPhrase] = useState('');
  const [lowTicketThreshold, setLowTicketThreshold] = useState(10);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('');
  
  // States for user management
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [cumulativeTickets, setCumulativeTickets] = useState(0);
  
  // States for notifications
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Check authentication status
  useEffect(() => {
    const verifySession = async () => {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin-login');
        return;
      }

      try {
        const { error: funcError } = await supabase.functions.invoke('admin-auth', {
          headers: { 'x-admin-token': token },
          method: 'GET'       });

        if (funcError) {
          navigate('/admin-login');
          return;
        }

        setIsAuthenticated(true);

        // Load admin settings
        setAdminUsername('admin');

        const storedThreshold = localStorage.getItem('lowTicketThreshold');
        if (storedThreshold) {
          setLowTicketThreshold(parseInt(storedThreshold));
        }

        // Load users
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        }
      } catch (error) {
        console.error(error);
        navigate('/admin-login');
      }
    };

    verifySession();    
  }, [navigate]);
  
  // Handle user selection
  const handleSelectUser = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    setSelectedUser(selectedUser || null);
    
    // Calculate cumulative tickets purchased
    if (selectedUser) {
      const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
      const userPurchases = purchases.filter((purchase: any) => purchase.userId === userId);
      const totalTickets = userPurchases.reduce((sum: number, purchase: any) => sum + purchase.amount, 0);
      setCumulativeTickets(totalTickets);
    } else {
      setCumulativeTickets(0);
    }
  };
  
  // Update user tickets
  const handleUpdateUserTickets = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const ticketsInput = document.getElementById('userTickets') as HTMLInputElement;
    const newTickets = parseInt(ticketsInput.value);
    
    if (isNaN(newTickets) || newTickets < 0) {
      setError('Veuillez entrer un nombre valide de tickets.');
      return;
    }
    
    const updatedUsers = users.map(u => 
      u.id === selectedUser.id ? { ...u, tickets: newTickets } : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setSelectedUser({ ...selectedUser, tickets: newTickets });
    setMessage('Tickets mis à jour avec succès.');
    setError('');
  };
  
  // Ban/Unban user
  const handleToggleBanUser = () => {
    if (!selectedUser) return;
    
    const updatedUsers = users.map(u => 
      u.id === selectedUser.id ? { ...u, isBanned: !u.isBanned } : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setSelectedUser({ ...selectedUser, isBanned: !selectedUser.isBanned });
    setMessage(`Utilisateur ${selectedUser.isBanned ? 'débloqué' : 'bloqué'} avec succès.`);
  };
  
  // Delete user
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${selectedUser.name} ?`)) {
      const updatedUsers = users.filter(u => u.id !== selectedUser.id);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setSelectedUser(null);
      setMessage('Utilisateur supprimé avec succès.');
    }
  };
  
  // Save API key
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || !encryptionPhrase) {
      setError('Veuillez entrer une clé API et une phrase d\'encryptage.');
      return;
    }
    
    try {
      const encryptedKey = encryptApiKey(apiKey, encryptionPhrase);
      storeEncryptedApiKey(encryptedKey, encryptionPhrase);
      
      setApiKey('');
      setEncryptionPhrase('');
      setMessage('Clé API sauvegardée avec succès.');
      setError('');
    } catch (err) {
      setError('Erreur lors de l\'encryptage de la clé API.');
      console.error(err);
    }
  };
  
  // Update low ticket threshold
  const handleUpdateThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNaN(lowTicketThreshold) || lowTicketThreshold < 0) {
      setError('Veuillez entrer un nombre valide pour le seuil de tickets bas.');
      return;
    }
    
    localStorage.setItem('lowTicketThreshold', lowTicketThreshold.toString());
    setMessage('Seuil mis à jour avec succès.');
    setError('');
  };
  
  // Update admin credentials
  const handleUpdateAdminCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminUsername || !adminPassword || !adminCurrentPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    
    // Get current admin credentials
    const storedCredentials = JSON.parse(localStorage.getItem('adminCredentials') || '{}');
    
    // Check current password
    if (adminCurrentPassword !== storedCredentials.password) {
      setError('Le mot de passe actuel est incorrect.');
      return;
    }
    
    // Update credentials
    const newCredentials: AdminCredentials = {
      username: adminUsername,
      password: adminPassword
    };
    
    localStorage.setItem('adminCredentials', JSON.stringify(newCredentials));
    
    setAdminCurrentPassword('');
    setAdminPassword('');
    setMessage('Identifiants administrateur mis à jour avec succès.');
    setError('');
  };
  
  // Update tool ticket cost based on active category
  const handleUpdateToolCost = (toolId: string, cost: number) => {
    if (isNaN(cost) || cost < 0) {
      setError('Veuillez entrer un coût valide.');
      return;
    }
    
    if (activeToolCategory === 'development') {
      updateDevelopmentToolTicketCost(toolId, cost);
    } else {
      updateMarketingToolTicketCost(toolId, cost);
    }
    
    setMessage('Coût de l\'outil mis à jour avec succès.');
    setError('');
  };
  
  // Update ticket package
  const handleUpdatePackage = (packageId: string, amount: number, price: number) => {
    if (isNaN(amount) || amount <= 0 || isNaN(price) || price <= 0) {
      setError('Veuillez entrer des valeurs valides.');
      return;
    }
    
    updateTicketPackage(packageId, amount, price);
    setMessage('Pack de tickets mis à jour avec succès.');
    setError('');
  };
  
  // Export users to Excel
  const handleExportUsers = () => {
    try {
      // Récupérer les achats pour calculer les tickets cumulés
      const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
      
      // Créer des données enrichies avec les tickets cumulés
      const enrichedUsers = users.map(user => {
        const userPurchases = purchases.filter((p: any) => p.userId === user.id);
        const totalPurchasedTickets = userPurchases.reduce((sum: number, p: any) => sum + p.amount, 0);
        
        return {
          ID: user.id,
          Nom: user.name,
          Email: user.email,
          Adresse: user.address,
          'Tickets actuels': user.tickets,
          'Tickets achetés cumulés': totalPurchasedTickets,
          Admin: user.isAdmin ? 'Oui' : 'Non',
          'Date de création': user.createdAt
        };
      });
      
      // Create a workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheet with user data
      const ws = XLSX.utils.json_to_sheet(enrichedUsers);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs');
      
      // Generate XLSX file
      XLSX.writeFile(wb, 'utilisateurs.xlsx');
      
      setMessage('Utilisateurs exportés avec succès.');
    } catch (err) {
      setError('Erreur lors de l\'exportation des utilisateurs.');
      console.error(err);
    }
  };
  
  // Log out
  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    navigate('/admin-login');
  };
  
  // Get current tools based on active category
  const currentTools = activeToolCategory === 'development' ? developmentTools : marketingTools;
  
  if (!isAuthenticated) {
    return <div>Redirection...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Administration (JgMsAC)</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Déconnexion
          </button>
        </div>
        
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
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'users' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Utilisateurs
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'tools' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Outils
              </button>
              <button
                onClick={() => setActiveTab('packages')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'packages' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Packs de tickets
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'settings' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Paramètres
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'users' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <h2 className="text-xl font-semibold mb-4">Liste des utilisateurs</h2>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((u) => (
                            <tr 
                              key={u.id} 
                              onClick={() => handleSelectUser(u.id)}
                              className={`cursor-pointer hover:bg-gray-50 ${selectedUser?.id === u.id ? 'bg-blue-50' : ''}`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                    <div className="text-sm text-gray-500">{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {u.tickets}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={handleExportUsers}
                      className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      Exporter les utilisateurs
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  {selectedUser ? (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Détails de l'utilisateur</h2>
                      
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Nom</p>
                            <p className="font-medium">{selectedUser.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{selectedUser.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tickets actuels</p>
                            <p className="font-medium">{selectedUser.tickets}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tickets achetés cumulés</p>
                            <p className="font-medium">{cumulativeTickets}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date de création</p>
                            <p className="font-medium">
                              {new Date(selectedUser.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">Adresse</p>
                            <p className="font-medium">{selectedUser.address}</p>
                          </div>
                        </div>
                      </div>
                      
                      <form onSubmit={handleUpdateUserTickets} className="mb-6">
                        <h3 className="font-semibold mb-2">Modifier les tickets</h3>
                        <div className="flex space-x-4">
                          <input
                            type="number"
                            id="userTickets"
                            defaultValue={selectedUser.tickets}
                            min="0"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                          />
                          <button 
                            type="submit" 
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                          >
                            Mettre à jour
                          </button>
                        </div>
                      </form>
                      
                      <div className="flex space-x-4">
                        <button
                          onClick={handleToggleBanUser}
                          className={`px-4 py-2 ${
                            selectedUser.isBanned 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-yellow-600 hover:bg-yellow-700'
                          } text-white rounded-md`}
                        >
                          {selectedUser.isBanned ? 'Débloquer' : 'Bloquer'}
                        </button>
                        <button
                          onClick={handleDeleteUser}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                      <p className="text-gray-500">Sélectionnez un utilisateur pour voir les détails</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'tools' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Configuration des outils</h2>
                
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-4 py-2 rounded-full ${
                        activeToolCategory === 'development' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveToolCategory('development')}
                    >
                      Outils de développement
                    </button>
                    <button
                      className={`px-4 py-2 rounded-full ${
                        activeToolCategory === 'marketing' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveToolCategory('marketing')}
                    >
                      Outils de Marketing
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outil</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coût (tickets)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentTools.filter(tool => !tool.isAffiliate).map((tool) => (
                        <tr key={tool.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 line-clamp-2">{tool.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              defaultValue={tool.ticketCost}
                              min="0"
                              className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                              data-tool-id={tool.id}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                const input = document.querySelector(`input[data-tool-id="${tool.id}"]`) as HTMLInputElement;
                                const newCost = parseInt(input?.value || String(tool.ticketCost));
                                handleUpdateToolCost(tool.id, newCost);
                              }}
                              className="text-primary hover:text-primary-dark"
                            >
                              Enregistrer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'packages' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Configuration des packs de tickets</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre de tickets</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix (€)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ticketPackages.map((pkg) => (
                        <tr key={pkg.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              defaultValue={pkg.amount}
                              min="1"
                              className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                              data-amount-id={pkg.id}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              defaultValue={pkg.price}
                              min="0.01"
                              step="0.01"
                              className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                              data-price-id={pkg.id}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                const amountInput = document.querySelector(`input[data-amount-id="${pkg.id}"]`) as HTMLInputElement;
                                const priceInput = document.querySelector(`input[data-price-id="${pkg.id}"]`) as HTMLInputElement;
                                const newAmount = parseInt(amountInput?.value || String(pkg.amount));
                                const newPrice = parseFloat(priceInput?.value || String(pkg.price));
                                handleUpdatePackage(pkg.id, newAmount, newPrice);
                              }}
                              className="text-primary hover:text-primary-dark"
                            >
                              Enregistrer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Configuration de l'API OpenAI</h2>
                  
                  <form onSubmit={handleSaveApiKey} className="space-y-4">
                    <div>
                      <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                        Clé API OpenAI
                      </label>
                      <input
                        id="apiKey"
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        placeholder="sk-..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="encryptionPhrase" className="block text-sm font-medium text-gray-700 mb-1">
                        Phrase d'encryptage
                      </label>
                      <input
                        id="encryptionPhrase"
                        type="text"
                        value={encryptionPhrase}
                        onChange={(e) => setEncryptionPhrase(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        placeholder="Phrase secrète..."
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Cette phrase est utilisée pour crypter la clé API. Ne la partagez avec personne.
                      </p>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      Sauvegarder la clé API
                    </button>
                  </form>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Configuration du seuil de tickets</h2>
                    
                    <form onSubmit={handleUpdateThreshold} className="space-y-4">
                      <div>
                        <label htmlFor="lowTicketThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                          Seuil de tickets bas
                        </label>
                        <input
                          id="lowTicketThreshold"
                          type="number"
                          value={lowTicketThreshold}
                          onChange={(e) => setLowTicketThreshold(parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                          min="0"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Les utilisateurs seront alertés lorsque leur nombre de tickets sera inférieur à ce seuil.
                        </p>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                      >
                        Mettre à jour
                      </button>
                    </form>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Modifier les identifiants administrateur</h2>
                  
                  <form onSubmit={handleUpdateAdminCredentials} className="space-y-4">
                    <div>
                      <label htmlFor="adminUsername" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom d'utilisateur
                      </label>
                      <input
                        id="adminUsername"
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="adminCurrentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe actuel
                      </label>
                      <input
                        id="adminCurrentPassword"
                        type="password"
                        value={adminCurrentPassword}
                        onChange={(e) => setAdminCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                        id="adminPassword"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      Mettre à jour les identifiants
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;