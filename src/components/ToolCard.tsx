import React from 'react';
import { Tool } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../context/ToolsContext';
import * as Icons from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useTool } = useTools();
  
  // Dynamically get the icon component
  const IconComponent = Icons[tool.iconName as keyof typeof Icons] || Icons.Box;
  
  const handleToolClick = async () => {
    // For affiliate tools, open the link directly without authentication check
    if (tool.isAffiliate && tool.url) {
      window.open(tool.url, '_blank');
      return;
    }
    
    // Marketing tools require authentication
    if (tool.category === 'marketing' && !user) {
      navigate('/login', { state: { from: `/tools/${tool.id}` } });
      return;
    }

    // Allow direct access to non-marketing tools when not authenticated
    if (!user) {
      navigate(`/tools/${tool.id}`);
      return;
    }
    // Check ticket count for paid tools
    if (user.tickets >= tool.ticketCost) {
      const success = await useTool(tool.id);
      if (success) {
        navigate(`/tools/${tool.id}`);
      }
    } else {
      // Not enough tickets, redirect to purchase page
      navigate('/buy-tickets', { 
        state: { message: `Vous n'avez pas assez de tickets pour utiliser cet outil. Il vous faut ${tool.ticketCost} tickets.` } 
      });
    }
  };
  
  return (
    <div className="card group hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-full bg-primary/10 text-primary">
          <IconComponent size={24} />
        </div>
        {!tool.isAffiliate && (
          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            {tool.ticketCost} ticket{tool.ticketCost > 1 ? 's' : ''}
          </div>
        )}
        {tool.isAffiliate && (
          <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            Gratuit
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{tool.description}</p>
      
      {/* Afficher les instructions d'utilisation pour les outils de marketing si elles existent */}
      {tool.category === 'marketing' && tool.usageInstructions && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800 font-medium mb-1">Mode d'emploi :</p>
          <p className="text-sm text-blue-700">{tool.usageInstructions}</p>
        </div>
      )}
      
      <div className="mt-auto">
        {tool.promoCode && (
          <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Code promo :</span> {tool.promoCode}
            </p>
          </div>
        )}
        
        <button
          onClick={handleToolClick}
          className="btn btn-primary w-full"
        >
          {tool.isAffiliate ? 'Visiter' : 'Utiliser'}
        </button>
      </div>
    </div>
  );
};

export default ToolCard;