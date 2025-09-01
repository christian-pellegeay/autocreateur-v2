import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Tool, TicketPackage, ToolUsage } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase/client';

interface ToolsContextType {
  developmentTools: Tool[];
  marketingTools: Tool[];
  ticketPackages: TicketPackage[];
  purchaseTickets: (packageId: string) => Promise<boolean>;
  useTool: (toolId: string) => Promise<boolean>;
  getToolUsageStats: () => Promise<ToolUsage[]>;
  updateDevelopmentToolTicketCost: (toolId: string, cost: number) => Promise<boolean>;
  updateMarketingToolTicketCost: (toolId: string, cost: number) => Promise<boolean>;
  updateTicketPackage: (packageId: string, amount: number, price: number) => Promise<boolean>;
  addTool: (tool: Tool) => Promise<boolean>;
  updateTool: (tool: Tool) => Promise<boolean>;
  deleteTool: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export const useTools = () => {
  const context = useContext(ToolsContext);
  if (context === undefined) {
    throw new Error('useTools must be used within a ToolsProvider');
  }
  return context;
};

export const ToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [developmentTools, setDevelopmentTools] = useState<Tool[]>([]);
  const [marketingTools, setMarketingTools] = useState<Tool[]>([]);
  const [ticketPackages, setTicketPackages] = useState<TicketPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, updateUser } = useAuth();
  
  // Use ref to prevent multiple fetches
  const fetchInitiated = useRef(false);

  // Initialize tools and packages from Supabase
  useEffect(() => {
    // Prevent multiple simultaneous fetches
    if (fetchInitiated.current) {
      return;
    }

    const fetchTools = async () => {
      fetchInitiated.current = true;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Test connection first
        const { data: testData, error: testError } = await supabase
          .from('tools')
          .select('*', { count: 'exact', head: true });
        
        if (testError) {
          throw new Error(`Connection failed: ${testError.message}`);
        }
        
        // Fetch all tools
        const { data: toolsData, error: toolsError } = await supabase
          .from('tools')
          .select('*')
          .order('name');
        
        if (toolsError) {
          throw new Error(`Failed to fetch tools: ${toolsError.message}`);
        }

        if (toolsData && toolsData.length > 0) {
          // Map Supabase data to our Tool type and separate by category
          const devTools: Tool[] = [];
          const mktTools: Tool[] = [];

          toolsData.forEach(tool => {
            const transformedTool: Tool = {
              id: tool.id,
              name: tool.name,
              description: tool.description,
              ticketCost: tool.ticket_cost,
              url: tool.url || undefined,
              isAffiliate: tool.is_affiliate,
              promoCode: tool.promo_code || undefined,
              iconName: tool.icon_name,
              category: tool.category as 'development' | 'marketing',
              model: tool.model || undefined,
              systemPrompt: tool.system_prompt || undefined,
              useAPI: tool.use_api,
              usageInstructions: tool.usage_instructions || undefined
            };

            if (tool.category === 'development') {
              devTools.push(transformedTool);
            } else if (tool.category === 'marketing') {
              mktTools.push(transformedTool);
            }
          });
          
          setDevelopmentTools(devTools);
          setMarketingTools(mktTools);
        } else {
          setError('Aucun outil trouvé dans la base de données');
        }

        // Fetch ticket packages
        const { data: packagesData, error: packagesError } = await supabase
          .from('ticket_packages')
          .select('*')
          .order('price');
        
        if (packagesError) {
          throw new Error(`Failed to fetch packages: ${packagesError.message}`);
        }

        if (packagesData) {
          // Map Supabase data to our TicketPackage type
          const transformedPackages: TicketPackage[] = packagesData.map(pkg => ({
            id: pkg.id,
            name: pkg.name,
            amount: pkg.amount,
            price: parseFloat(pkg.price)
          }));

          setTicketPackages(transformedPackages);
        }
        
      } catch (error) {
        console.error('Error in tools context initialization:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des outils');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []); // Empty dependency array - only run once

  // Purchase tickets
  const purchaseTickets = async (packageId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    const selectedPackage = ticketPackages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      return false;
    }
    
    try {
      // Start a transaction
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('tickets')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        return false;
      }
      
      if (!userData) {
        return false;
      }

      const currentTickets = userData.tickets;
      const newTicketTotal = currentTickets + selectedPackage.amount;
      
      // Record purchase
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert([{
          user_id: user.id,
          package_id: selectedPackage.id,
          amount: selectedPackage.amount,
          price: selectedPackage.price
        }]);
      
      if (purchaseError) {
        return false;
      }

      // Update user's tickets
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ tickets: newTicketTotal })
        .eq('id', user.id);
      
      if (updateError) {
        return false;
      }
      
      // Update local user state
      if (user) {
        updateUser({
          ...user,
          tickets: newTicketTotal
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      return false;
    }
  };

  // Use a tool (spend tickets)
  const useTool = async (toolId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    // Find the tool in either category
    const devTool = developmentTools.find(t => t.id === toolId);
    const mktTool = marketingTools.find(t => t.id === toolId);
    const tool = devTool || mktTool;
    
    if (!tool) {
      return false;
    }
    
    // If it's an affiliate tool (free) or user has enough tickets
    if (tool.isAffiliate || user.tickets >= tool.ticketCost) {
      try {
        // If it's not an affiliate tool, deduct tickets
        if (!tool.isAffiliate) {
          // Get current ticket count to ensure we have the latest value
          const { data: userData, error: userError } = await supabase
            .from('user_profiles')
            .select('tickets')
            .eq('id', user.id)
            .single();
          
          if (userError) {
            return false;
          }
          
          if (!userData) {
            return false;
          }

          const currentTickets = userData.tickets;
          
          if (currentTickets < tool.ticketCost) {
            return false; // Not enough tickets
          }
          
          const newTicketTotal = currentTickets - tool.ticketCost;
          
          // Update user's tickets in the database
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ tickets: newTicketTotal })
            .eq('id', user.id);
          
          if (updateError) {
            return false;
          }

          // Record tool usage
          const { error: usageError } = await supabase
            .from('tool_usages')
            .insert([{
              user_id: user.id,
              tool_id: tool.id,
              tickets_used: tool.ticketCost
            }]);
          
          if (usageError) {
            return false;
          }
          
          // Update local user state
          updateUser({
            ...user,
            tickets: newTicketTotal
          });
        }
        
        return true;
      } catch (error) {
        console.error('Error using tool:', error);
        return false;
      }
    }
    
    return false;
  };

  // Get tool usage statistics
  const getToolUsageStats = async (): Promise<ToolUsage[]> => {
    if (!user) {
      return [];
    }
    
    try {
      let query = supabase
        .from('tool_usages')
        .select(`
          id,
          user_id,
          tool_id,
          tickets_used,
          created_at,
          tools(name)
        `);
      
      // Filter for current user if not admin
      if (!user.isAdmin) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        return [];
      }
      
      // Transform data to match our ToolUsage type
      const usages: ToolUsage[] = data.map(usage => ({
        id: usage.id,
        userId: usage.user_id,
        toolId: usage.tool_id,
        toolName: usage.tools?.name || undefined,
        date: usage.created_at,
        ticketsUsed: usage.tickets_used
      }));
      
      return usages;
    } catch (error) {
      console.error('Error getting tool usage stats:', error);
      return [];
    }
  };

  // Add a new tool
  const addTool = async (tool: Tool): Promise<boolean> => {
    try {
      // Map our Tool type to Supabase schema
      const { error } = await supabase
        .from('tools')
        .insert([{
          id: tool.id,
          name: tool.name,
          description: tool.description,
          ticket_cost: tool.ticketCost,
          url: tool.url,
          is_affiliate: tool.isAffiliate,
          promo_code: tool.promoCode,
          icon_name: tool.iconName,
          category: tool.category,
          model: tool.model,
          system_prompt: tool.systemPrompt,
          use_api: tool.useAPI || false,
          usage_instructions: tool.usageInstructions
        }]);
      
      if (error) {
        return false;
      }
      
      // Update local state
      if (tool.category === 'development') {
        setDevelopmentTools(prev => [...prev, tool]);
      } else if (tool.category === 'marketing') {
        setMarketingTools(prev => [...prev, tool]);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding tool:', error);
      return false;
    }
  };

  // Update an existing tool
  const updateTool = async (tool: Tool): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tools')
        .update({
          name: tool.name,
          description: tool.description,
          ticket_cost: tool.ticketCost,
          url: tool.url,
          is_affiliate: tool.isAffiliate,
          promo_code: tool.promoCode,
          icon_name: tool.iconName,
          category: tool.category,
          model: tool.model,
          system_prompt: tool.systemPrompt,
          use_api: tool.useAPI || false,
          usage_instructions: tool.usageInstructions
        })
        .eq('id', tool.id);

      if (error) {
        return false;
      }

      // Update local state and handle category changes
      if (tool.category === 'development') {
        setDevelopmentTools(prev =>
          prev.some(t => t.id === tool.id)
            ? prev.map(t => (t.id === tool.id ? tool : t))
            : [...prev, tool]
        );
        setMarketingTools(prev => prev.filter(t => t.id !== tool.id));
      } else {
        setMarketingTools(prev =>
          prev.some(t => t.id === tool.id)
            ? prev.map(t => (t.id === tool.id ? tool : t))
            : [...prev, tool]
        );
        setDevelopmentTools(prev => prev.filter(t => t.id !== tool.id));
      }

      return true;
    } catch (error) {
      console.error('Error updating tool:', error);
      return false;
    }
  };

  // Delete a tool
  const deleteTool = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('tools').delete().eq('id', id);

      if (error) {
        return false;
      }

      setDevelopmentTools(prev => prev.filter(tool => tool.id !== id));
      setMarketingTools(prev => prev.filter(tool => tool.id !== id));

      return true;
    } catch (error) {
      console.error('Error deleting tool:', error);
      return false;
    }
  };

  // Update development tool ticket cost (admin only)
  const updateDevelopmentToolTicketCost = async (toolId: string, cost: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tools')
        .update({ ticket_cost: cost })
        .eq('id', toolId)
        .eq('category', 'development');
      
      if (error) {
        return false;
      }
      
      // Update local state
      setDevelopmentTools(prev => 
        prev.map(tool => tool.id === toolId ? { ...tool, ticketCost: cost } : tool)
      );
      
      return true;
    } catch (error) {
      console.error('Error updating development tool cost:', error);
      return false;
    }
  };

  // Update marketing tool ticket cost (admin only)
  const updateMarketingToolTicketCost = async (toolId: string, cost: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tools')
        .update({ ticket_cost: cost })
        .eq('id', toolId)
        .eq('category', 'marketing');
      
      if (error) {
        return false;
      }
      
      // Update local state
      setMarketingTools(prev => 
        prev.map(tool => tool.id === toolId ? { ...tool, ticketCost: cost } : tool)
      );
      
      return true;
    } catch (error) {
      console.error('Error updating marketing tool cost:', error);
      return false;
    }
  };

  // Update ticket package (admin only)
  const updateTicketPackage = async (packageId: string, amount: number, price: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ticket_packages')
        .update({ amount, price })
        .eq('id', packageId);
      
      if (error) {
        return false;
      }
      
      // Update local state
      setTicketPackages(prev => 
        prev.map(pkg => pkg.id === packageId ? { ...pkg, amount, price } : pkg)
      );
      
      return true;
    } catch (error) {
      console.error('Error updating ticket package:', error);
      return false;
    }
  };

  const value = {
    developmentTools,
    marketingTools,
    ticketPackages,
    purchaseTickets,
    useTool,
    getToolUsageStats,
    updateDevelopmentToolTicketCost,
    updateMarketingToolTicketCost,
    updateTicketPackage,
    addTool,
    updateTool,
    deleteTool,
    isLoading,
    error
  };

  return <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>;
};