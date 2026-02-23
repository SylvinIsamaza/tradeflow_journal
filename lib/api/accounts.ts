import { privateClient } from './axios';
import { Account, AccountType } from '@/types';

// API response types matching backend schemas
interface AccountResponse {
  id: string;
  user_id: string;
  broker_name: string;
  base_currency: string;
  name: string;
  type: string;
  created_at: string;
}

interface CreateAccountRequest {
  broker_name: string;
  base_currency?: string;
  name: string;
  type: AccountType;
}

interface UpdateAccountRequest {
  broker_name?: string;
  base_currency?: string;
  name?: string;
}

// Convert snake_case to camelCase
const transformAccount = (account: AccountResponse): Account => ({
  id: account.id,
  userId: account.user_id,
  brokerName: account.broker_name,
  baseCurrency: account.base_currency,
  name: account.name,
  type: account.type as AccountType,
  createdAt: account.created_at,
});

// ============================================
// Accounts API Service
// ============================================

export const accountsApi = {
  // Get all accounts for current user
  async getAll(): Promise<Account[]> {
    const response = await privateClient.get<AccountResponse[]>('/accounts/');
    return response.data.map(transformAccount);
  },

  // Get single account
  async getById(accountId: string): Promise<Account | null> {
    try {
      const response = await privateClient.get<AccountResponse>(`/accounts/${accountId}`);
      return transformAccount(response.data);
    } catch (error) {
      return null;
    }
  },

  // Create new account
  async create(data: CreateAccountRequest): Promise<Account> {
    const response = await privateClient.post<AccountResponse>('/accounts/', data);
    return transformAccount(response.data);
  },

  // Update account
  async update(accountId: string, data: UpdateAccountRequest): Promise<Account> {
    const response = await privateClient.put<AccountResponse>(`/accounts/${accountId}`, data);
    return transformAccount(response.data);
  },

  // Delete account
  async delete(accountId: string): Promise<void> {
    await privateClient.delete(`/accounts/${accountId}`);
  },
};

export default accountsApi;