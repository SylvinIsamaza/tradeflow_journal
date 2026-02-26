import { privateClient } from './axios';
import { Strategy, PaginationInfo } from '@/types';

interface StrategyResponse {
  id: string;
  account_id: string;
  name: string;
  description: string | null;
  entry_rules: string[];
  exit_rules: string[];
  risk_rules: string[];
  color: string | null;
  created_at: string;
}

interface PaginatedStrategyResponse {
  items: StrategyResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const transformStrategy = (s: StrategyResponse): Strategy => ({
  id: s.id,
  accountId: s.account_id,
  name: s.name,
  description: s.description || undefined,
  entryRules: s.entry_rules,
  exitRules: s.exit_rules,
  riskRules: s.risk_rules,
  color: s.color || '#5e5ce6',
  createdAt: s.created_at,
});

export const strategiesApi = {
  async getAll(accountId?: string, limit: number = 50, offset: number = 0): Promise<{ strategies: Strategy[]; pagination: PaginationInfo }> {
    let params = '';
    if (accountId) params += `account_id=${accountId}`;
    if (params) params += '&';
    params += `limit=${limit}&offset=${offset}`;
    
    const response = await privateClient.get<PaginatedStrategyResponse>(`/strategies/?${params}`);
    return {
      strategies: response.data.items.map(transformStrategy),
      pagination: {
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.total_pages
      }
    };
  },

  async getById(id: string): Promise<Strategy | null> {
    try {
      const response = await privateClient.get<StrategyResponse>(`/strategies/${id}`);
      return transformStrategy(response.data);
    } catch {
      return null;
    }
  },

  async create(data: {
    account_id: string;
    name: string;
    description?: string;
    entry_rules?: string[];
    exit_rules?: string[];
    risk_rules?: string[];
    color?: string;
  }): Promise<Strategy> {
    const response = await privateClient.post<StrategyResponse>('/strategies/', data);
    return transformStrategy(response.data);
  },

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    entry_rules: string[];
    exit_rules: string[];
    risk_rules: string[];
    color: string;
  }>): Promise<Strategy> {
    const response = await privateClient.put<StrategyResponse>(`/strategies/${id}`, data);
    return transformStrategy(response.data);
  },

  async delete(id: string): Promise<void> {
    await privateClient.delete(`/strategies/${id}`);
  },
};

export default strategiesApi;
