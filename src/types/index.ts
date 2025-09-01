export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Hashed
  address: string;
  tickets: number;
  isAdmin: boolean;
  isBanned?: boolean;
  createdAt: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  ticketCost: number;
  url?: string;
  isAffiliate: boolean;
  promoCode?: string;
  iconName: string;
  category: 'development' | 'marketing';
  // Nouveaux champs pour l'API OpenAI
  model?: string;
  systemPrompt?: string;
  useAPI?: boolean;
  // Nouveau champ pour les instructions d'utilisation
  usageInstructions?: string;
}

export interface TicketPackage {
  id: string;
  name: string;
  amount: number;
  price: number;
}

interface PurchaseHistory {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  price: number;
  date: string;
}

export interface ToolUsage {
  id: string;
  userId: string;
  toolId: string;
  toolName?: string;
  date: string;
  ticketsUsed: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}