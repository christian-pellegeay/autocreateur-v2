import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../context/ToolsContext';
import { User, Tool, TicketPackage, ToolUsage } from '../../types';
import { supabase } from '../../supabase/client';
import * as XLSX from 'xlsx';
import * as Icons from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { 
    developmentTools, 
    marketingTools, 
    ticketPackages, 
    updateDevelopmentToolTicketCost, 
    updateMarketingToolTicketCost,
    updateTicketPackage,
    getToolUsageStats,
    addTool,
    updateTool,
    deleteTool
  } = useTools();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [activeToolCategory, setActiveToolCategory] = useState<'development' | 'marketing'>('development');
  const [lowTicketThreshold, setLowTicketThreshold] = useState(10);
  const [toolUsageStats, setToolUsageStats] = useState<ToolUsage[]>([]);
  const [loading, setLoading] = useState(true);

  // State for new tool form
  const [showNewToolForm, setShowNewToolForm] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const initialToolState: Partial<Tool> = {
    id: '',
    name: '',
    description: '',
    ticketCost: 0,
    url: '',
    isAffiliate: false,
    promoCode: '',
    iconName: 'Tool',
    category: 'development',
    model: '',
    systemPrompt: '',
    useAPI: false,
    usageInstructions: ''
  };
  const [newTool, setNewTool] = useState<Partial<Tool>>(initialToolState);

  // Load users from Supabase and configuration
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        console.log('Fetching users and configuration...');
        setLoading(true);
        
        // Fetch all user profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*');
        
        if (profilesError) {
          console.error('Error fetching user profiles:', profilesError);
          return;
        }
        
        console.log(`Fetched ${profilesData?.length || 0} user profiles`);
        
        // Fetch auth users to get emails
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('Error fetching auth users:', authError);
          return;
        }
        
        console.log(`Fetched ${authData?.users?.length || 0} auth users`);
        
        // Combine the data
        const combinedUsers: User[] = profilesData.map(profile => {
          const authUser = authData.users.find(u => u.id === profile.id);
          return {
            id: profile.id,
            name: profile.full_name,
            email: authUser?.email || '',
            password: '', // We don't store passwords
            address: profile.address,
            tickets: profile.tickets,
            isAdmin: profile.is_admin,
            createdAt: profile.created_at
          };
        });
        
        setUsers(combinedUsers);
        
        // Load low ticket threshold
        const { data: configData } = await supabase
          .from('app_configuration')
          .select('value')
          .eq('key', 'lowTicketThreshold')
          .single();
        
        if (configData) {
          setLowTicketThreshold(parseInt(configData.value));
        }
        
        // Load tool usage stats
        const stats = await getToolUsageStats();
        setToolUsageStats(stats);
        
      } catch (err) {
        console.error('Error in admin panel initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate, getToolUsageStats]);

  // Handle user selection
  const handleSelectUser = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    setSelectedUser(selectedUser || null);
  };

  // Update user tickets
  const handleUpdateTickets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const ticketsInput = document.getElementById('tickets') as HTMLInputElement;
    const newTickets = parseInt(ticketsInput.value);

    if (isNaN(newTickets) || newTickets < 0) {
      setError('Veuillez entrer un nombre valide de tickets.');
      return;
    }

    try {
      // Update tickets in Supabase
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ tickets: newTickets })
        .eq('id', selectedUser.id);
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      // Update local state
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id ? { ...u, tickets: newTickets } : u
      );
      
      setUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, tickets: newTickets });
      setMessage('Tickets mis à jour avec succès.');
      setError('');
    } catch (err: any) {
      setError('Erreur lors de la mise à jour des tickets: ' + err.message);
      console.error(err);
    }
  };

  // Ban/Unban user
  const handleToggleBan = async () => {
    if (!selectedUser) return;

    try {
      // In a real implementation, you would update a 'is_banned' field in the user_profiles table
      // and also disable the user in auth.users
      
      // For now, we'll just update the local state to simulate the functionality
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id ? { ...u, isBanned: !u.isBanned } : u
      );
      
      setUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, isBanned: !selectedUser.isBanned });
      setMessage(`Utilisateur ${selectedUser.isBanned ? 'débloqué' : 'bloqué'} avec succès.`);
    } catch (err: any) {
      setError('Erreur lors de la modification du statut: ' + err.message);
      console.error(err);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${selectedUser.name} ?`)) {
      try {
        console.log(`Deleting user ${selectedUser.id}`);
        
        // Call our Edge Function to delete the user securely
        const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`;
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('Vous devez être connecté pour effectuer cette action');
        }
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            userId: selectedUser.id
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        }
        
        console.log('User deleted via Edge Function');
        
        // The profile should be automatically deleted due to the foreign key constraint
        
        // Update local state
        const updatedUsers = users.filter(u => u.id !== selectedUser.id);
        setUsers(updatedUsers);
        setSelectedUser(null);
        setMessage('Utilisateur supprimé avec succès.');
      } catch (err: any) {
        setError('Erreur lors de la suppression de l\'utilisateur: ' + err.message);
        console.error(err);
      }
    }
  };

  // Update low ticket threshold
  const handleUpdateThreshold = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isNaN(lowTicketThreshold) || lowTicketThreshold < 0) {
      setError('Veuillez entrer un nombre valide pour le seuil de tickets bas.');
      return;
    }

    try {
      // Check if configuration entry already exists
      const { data } = await supabase
        .from('app_configuration')
        .select('*')
        .eq('key', 'lowTicketThreshold');
      
      if (data && data.length > 0) {
        // Update existing entry
        await supabase
          .from('app_configuration')
          .update({ value: lowTicketThreshold.toString() })
          .eq('key', 'lowTicketThreshold');
      } else {
        // Insert new entry
        await supabase
          .from('app_configuration')
          .insert([{ key: 'lowTicketThreshold', value: lowTicketThreshold.toString() }]);
      }
      
      setMessage('Seuil mis à jour avec succès.');
      setError('');
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du seuil: ' + err.message);
      console.error(err);
    }
  };

  // Update tool ticket cost based on the active category
  const handleUpdateToolCost = async (toolId: string, cost: number) => {
    if (isNaN(cost) || cost < 0) {
      setError('Veuillez entrer un coût valide.');
      return;
    }

    try {
      let success = false;
      
      if (activeToolCategory === 'development') {
        success = await updateDevelopmentToolTicketCost(toolId, cost);
      } else {
        success = await updateMarketingToolTicketCost(toolId, cost);
      }
      
      if (success) {
        setMessage('Coût de l\'outil mis à jour avec succès.');
        setError('');
      } else {
        throw new Error('La mise à jour a échoué.');
      }
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du coût: ' + err.message);
      console.error(err);
    }
  };

  // Update ticket package
  const handleUpdatePackage = async (packageId: string, amount: number, price: number) => {
    if (isNaN(amount) || amount <= 0 || isNaN(price) || price <= 0) {
      setError('Veuillez entrer des valeurs valides.');
      return;
    }

    try {
      const success = await updateTicketPackage(packageId, amount, price);
      
      if (success) {
        setMessage('Pack de tickets mis à jour avec succès.');
        setError('');
      } else {
        throw new Error('La mise à jour a échoué.');
      }
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du pack: ' + err.message);
      console.error(err);
    }
  };

  // Handle new tool form input changes
  const handleNewToolChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewTool(prev => ({ ...prev, [name]: checked }));
    } else {
      setNewTool(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit tool form for add or update
  const handleSubmitTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!newTool.id || !newTool.name || !newTool.description || !newTool.iconName || !newTool.category) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const allTools = [...developmentTools, ...marketingTools];
    if (!editingTool && allTools.some(t => t.id === newTool.id)) {
      setError('Cet identifiant d\'outil existe déjà. Veuillez en choisir un autre.');
      return;
    }

    try {
      let success = false;
      if (editingTool) {
        success = await updateTool(newTool as Tool);
      } else {
        success = await addTool(newTool as Tool);
      }

      if (success) {
        setMessage(editingTool ? 'Outil mis à jour avec succès.' : 'Outil ajouté avec succès.');
        setNewTool({ ...initialToolState, category: activeToolCategory });
        setEditingTool(null);
        setShowNewToolForm(false);
      } else {
        throw new Error(editingTool ? "La mise à jour de l'outil a échoué." : "L'ajout de l'outil a échoué.");
      }
    } catch (err: any) {
      setError(`Erreur lors ${editingTool ? 'de la mise à jour' : 'de l\'ajout'} de l\'outil: ` + err.message);
      console.error(err);
    }
  };

  const handleEditToolClick = (tool: Tool) => {
    setEditingTool(tool);
    setNewTool(tool);
    setShowNewToolForm(true);
  };

  const handleDeleteTool = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet outil ?")) {
      try {
        const success = await deleteTool(id);
        if (success) {
          setMessage('Outil supprimé avec succès.');
          setError('');
        } else {
          throw new Error('La suppression a échoué.');
        }
      } catch (err: any) {
        setError("Erreur lors de la suppression de l'outil: " + err.message);
        console.error(err);
      }
    }
  };

  // Export users to Excel
  const handleExportUsers = async () => {
    try {
      // Fetch all purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('*');
      
      if (purchasesError) {
        throw new Error(purchasesError.message);
      }
      
      // Create enriched data with cumulative tickets
      const enrichedUsers = users.map(user => {
        const userPurchases = purchases?.filter(p => p.user_id === user.id) || [];
        const totalPurchasedTickets = userPurchases.reduce((sum, p) => sum + p.amount, 0);
        
        return {
          ID: user.id,
          Nom: user.name,
          Email: user.email,
          Adresse: user.address,
          'Tickets actuels': user.tickets,
          'Tickets achetés cumulés': totalPurchasedTickets,
          Admin: user.isAdmin ? 'Oui' : 'Non',
          'Date de création': new Date(user.createdAt).toLocaleDateString()
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
    } catch (err: any) {
      setError('Erreur lors de l\'exportation des utilisateurs: ' + err.message);
      console.error(err);
    }
  };

  // Group by tool
  const usageByTool = toolUsageStats.reduce((acc, usage) => {
    const toolName = usage.toolName || 'Outil inconnu';
    
    if (!acc[toolName]) {
      acc[toolName] = {
        count: 0,
        ticketsUsed: 0
      };
    }
    
    acc[toolName].count += 1;
    acc[toolName].ticketsUsed += usage.ticketsUsed;
    
    return acc;
  }, {} as Record<string, { count: number, ticketsUsed: number }>);

  // Obtenir les outils actuels en fonction de la catégorie active
  const currentTools = activeToolCategory === 'development' ? developmentTools : marketingTools;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Administration</h2>
        
        {!user?.isAdmin && (
          <div className="p-4 bg-red-50 rounded-lg text-red-800 mb-6">
            Vous n'avez pas les droits d'administration.
          </div>
        )}
        
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
        
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`py-4 px-1 ${activeTab === 'tools' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Outils
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`py-4 px-1 ${activeTab === 'packages' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Packs de tickets
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 ${activeTab === 'settings' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 ${activeTab === 'stats' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Statistiques
            </button>
          </nav>
        </div>
        
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">Liste des utilisateurs</h3>
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
                  className="btn btn-secondary w-full"
                >
                  Exporter les utilisateurs
                </button>
              </div>
            </div>
            
            <div className="md:col-span-2">
              {selectedUser ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Détails de l'utilisateur</h3>
                  
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
                        <p className="text-sm text-gray-500">Tickets</p>
                        <p className="font-medium">{selectedUser.tickets}</p>
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
                  
                  <form onSubmit={handleUpdateTickets} className="mb-6">
                    <h4 className="font-semibold mb-2">Modifier les tickets</h4>
                    <div className="flex space-x-4">
                      <input
                        type="number"
                        id="tickets"
                        defaultValue={selectedUser.tickets}
                        min="0"
                        className="input"
                      />
                      <button type="submit" className="btn btn-primary">
                        Mettre à jour
                      </button>
                    </div>
                  </form>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={handleToggleBan}
                      className={`btn ${selectedUser.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white`}
                    >
                      {selectedUser.isBanned ? 'Débloquer' : 'Bloquer'}
                    </button>
                    <button
                      onClick={handleDeleteUser}
                      className="btn bg-red-600 hover:bg-red-700 text-white"
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Configuration des outils</h3>
              
              <button
                onClick={() => {
                  if (showNewToolForm) {
                    setEditingTool(null);
                    setNewTool({ ...initialToolState, category: activeToolCategory });
                  } else {
                    setNewTool({ ...initialToolState, category: activeToolCategory });
                  }
                  setShowNewToolForm(!showNewToolForm);
                }}
                className="btn btn-primary"
              >
                {showNewToolForm ? 'Annuler' : 'Ajouter un outil'}
              </button>
            </div>
            
            {showNewToolForm && (
              <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">{editingTool ? "Modifier l'outil" : 'Ajouter un nouvel outil'}</h4>
                
                <form onSubmit={handleSubmitTool} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                        ID de l'outil <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="id"
                        name="id"
                        type="text"
                        value={newTool.id || ''}
                        onChange={handleNewToolChange}
                        className="input"
                        placeholder="ex: my-new-tool"
                        required
                        disabled={!!editingTool}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Identifiant unique sans espaces ni caractères spéciaux
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de l'outil <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={newTool.name || ''}
                        onChange={handleNewToolChange}
                        className="input"
                        placeholder="ex: Mon Nouvel Outil"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={newTool.description || ''}
                        onChange={handleNewToolChange}
                        className="input"
                        rows={3}
                        placeholder="Description détaillée de l'outil..."
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={newTool.category || 'development'}
                        onChange={handleNewToolChange}
                        className="input"
                        required
                      >
                        <option value="development">Développement</option>
                        <option value="marketing">Marketing</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="ticketCost" className="block text-sm font-medium text-gray-700 mb-1">
                        Coût en tickets <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="ticketCost"
                        name="ticketCost"
                        type="number"
                        value={newTool.ticketCost || 0}
                        onChange={handleNewToolChange}
                        className="input"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="iconName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de l'icône <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="iconName"
                        name="iconName"
                        value={newTool.iconName || 'Tool'}
                        onChange={handleNewToolChange}
                        className="input"
                        required
                      >
                        {Object.keys(Icons).map(iconName => (
                          <option key={iconName} value={iconName}>{iconName}</option>
                        ))}
                      </select>
                      {newTool.iconName && (
                        <div className="mt-2 flex items-center">
                          <span className="mr-2">Aperçu:</span>
                          {React.createElement(Icons[newTool.iconName as keyof typeof Icons] || Icons.Tool, { size: 20 })}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="isAffiliate"
                        name="isAffiliate"
                        type="checkbox"
                        checked={newTool.isAffiliate || false}
                        onChange={e => setNewTool(prev => ({ ...prev, isAffiliate: e.target.checked }))}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="isAffiliate" className="ml-2 block text-sm text-gray-700">
                        Outil affilié
                      </label>
                    </div>
                    
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                        URL (pour les outils affiliés)
                      </label>
                      <input
                        id="url"
                        name="url"
                        type="url"
                        value={newTool.url || ''}
                        onChange={handleNewToolChange}
                        className="input"
                        placeholder="https://example.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Code promo (optionnel)
                      </label>
                      <input
                        id="promoCode"
                        name="promoCode"
                        type="text"
                        value={newTool.promoCode || ''}
                        onChange={handleNewToolChange}
                        className="input"
                        placeholder="CODE10"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="useAPI"
                        name="useAPI"
                        type="checkbox"
                        checked={newTool.useAPI || false}
                        onChange={e => setNewTool(prev => ({ ...prev, useAPI: e.target.checked }))}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="useAPI" className="ml-2 block text-sm text-gray-700">
                        Utilise l'API OpenAI
                      </label>
                    </div>
                    
                    {newTool.useAPI && (
                      <>
                        <div>
                          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                            Modèle OpenAI
                          </label>
                          <select
                            id="model"
                            name="model"
                            value={newTool.model || ''}
                            onChange={handleNewToolChange}
                            className="input"
                          >
                            <option value="">Sélectionnez un modèle</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-4o">GPT-4o</option>
                          </select>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                            Prompt système
                          </label>
                          <textarea
                            id="systemPrompt"
                            name="systemPrompt"
                            value={newTool.systemPrompt || ''}
                            onChange={handleNewToolChange}
                            className="input"
                            rows={5}
                            placeholder="Instructions pour l'IA..."
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Champ pour les instructions d'utilisation (visible uniquement pour les outils de marketing) */}
                    {newTool.category === 'marketing' && (
                      <div className="md:col-span-2">
                        <label htmlFor="usageInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                          Mode d'emploi
                        </label>
                        <textarea
                          id="usageInstructions"
                          name="usageInstructions"
                          value={newTool.usageInstructions || ''}
                          onChange={handleNewToolChange}
                          className="input"
                          rows={5}
                          placeholder="Instructions détaillées pour l'utilisation de l'outil..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Ces instructions seront affichées uniquement pour les outils de marketing, sous la description de l'outil.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTool(null);
                        setNewTool({ ...initialToolState, category: activeToolCategory });
                        setShowNewToolForm(false);
                      }}
                      className="btn btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      {editingTool ? "Mettre à jour l'outil" : "Ajouter l'outil"}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
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
                      <td className="px-6 py-4 whitespace-nowrap space-x-4">
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
                        <button
                          onClick={() => handleEditToolClick(tool)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteTool(tool.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
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
            <h3 className="text-lg font-semibold mb-4">Configuration des packs de tickets</h3>
            
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
          <div>
            <h3 className="text-lg font-semibold mb-4">Configuration générale</h3>
            
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
                  className="input"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Les utilisateurs seront alertés lorsque leur nombre de tickets sera inférieur à ce seuil.
                </p>
              </div>
              
              <button type="submit" className="btn btn-primary">
                Mettre à jour
              </button>
            </form>
            
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Note importante sur l'API OpenAI</h4>
              <p className="text-yellow-700 mt-2">
                Pour configurer la clé API OpenAI, veuillez l'ajouter comme variable d'environnement nommée <code>OPENAI_API_KEY</code> directement dans le tableau de bord Supabase, dans la section Edge Functions. Cette clé sera alors disponible de manière sécurisée pour toutes les fonctions Edge qui en ont besoin.
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Statistiques d'utilisation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Utilisateurs</h4>
                <p className="text-3xl font-bold">{users.length}</p>
                <p className="text-gray-500">Utilisateurs inscrits</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Tickets utilisés</h4>
                <p className="text-3xl font-bold">
                  {toolUsageStats.reduce((sum, usage) => sum + usage.ticketsUsed, 0)}
                </p>
                <p className="text-gray-500">Total de tickets consommés</p>
              </div>
            </div>
            
            <h4 className="font-semibold mb-2">Utilisation par outil</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outil</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre d'utilisations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets utilisés</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(usageByTool).map(([toolName, stats]) => (
                    <tr key={toolName}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{toolName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stats.count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stats.ticketsUsed}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;