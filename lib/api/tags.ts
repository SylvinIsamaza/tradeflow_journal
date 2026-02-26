import { privateClient } from './axios';
import { PaginationInfo } from '@/types';

// API response types matching backend schemas
interface TagResponse {
  id: string;
  account_id: string;
  name: string;
  type: string;
  strategy_id: number | null;
  color: string | null;
  created_at: string;
}

interface PaginatedTagResponse {
  items: TagResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface TagCreate {
  account_id: string;
  name: string;
  type: string;
  strategy_id?: number;
  color?: string;
}

interface TagUpdate {
  name?: string;
  color?: string;
}

interface TagFilters {
  account_id?: string;
  type?: string;
  strategy_id?: string;
}

// ============================================
// Tags API Service
// ============================================

export const tagsApi = {
  // Get all tags with filters and pagination
  async getAll(filters: TagFilters = {}): Promise<{ tags: TagResponse[]; pagination: PaginationInfo }> {
    const params = new URLSearchParams();
    
    if (filters.account_id) params.append('account_id', filters.account_id);
    if (filters.type) params.append('type', filters.type);
    if (filters.strategy_id) params.append('strategy_id', filters.strategy_id);
    params.append('limit', '50');

    const response = await privateClient.get<PaginatedTagResponse>(`/tags/?${params.toString()}`);
    return {
      tags: response.data.items,
      pagination: {
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.total_pages
      }
    };
  },

  // Get single tag
  async getById(tagId: string): Promise<TagResponse | null> {
    try {
      const response = await privateClient.get<TagResponse>(`/tags/${tagId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Create new tag
  async create(data: TagCreate): Promise<TagResponse> {
    const response = await privateClient.post<TagResponse>('/tags/', data);
    return response.data;
  },

  // Update tag
  async update(tagId: string, data: TagUpdate): Promise<TagResponse> {
    const response = await privateClient.put<TagResponse>(`/tags/${tagId}`, data);
    return response.data;
  },

  // Delete tag
  async delete(tagId: string): Promise<void> {
    await privateClient.delete(`/tags/${tagId}`);
  },
};

export default tagsApi;