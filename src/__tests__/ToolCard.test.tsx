import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ToolCard from '../components/ToolCard';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('../context/ToolsContext', () => ({
  useTools: () => ({ useTool: vi.fn() }),
}));

describe('ToolCard', () => {
  it('renders tool name', () => {
    const tool = {
      id: '1',
      name: 'Test Tool',
      description: 'A simple tool',
      ticketCost: 3,
      isAffiliate: false,
      iconName: 'Box',
      category: 'development' as const,
    };

    render(<ToolCard tool={tool} />);
    expect(screen.getByText('Test Tool')).toBeTruthy();
  });
});