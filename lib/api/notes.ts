import { privateClient } from './axios';
import { Note, Folder } from '@/types';

interface FolderResponse {
  id: string;
  account_id: string;
  name: string;
  created_at: string;
}

interface NoteResponse {
  id: string;
  account_id: string;
  folder_id: string | null;
  title: string;
  content: string | null;
  tags: string[];
  date: string;
  created_at: string;
  updated_at: string | null;
}

const transformFolder = (f: FolderResponse): Folder => ({
  id: f.id,
  accountId: f.account_id,
  name: f.name,
  createdAt: f.created_at,
});

const transformNote = (n: NoteResponse): Note => ({
  id: n.id,
  accountId: n.account_id,
  folderId: n.folder_id || '',
  title: n.title,
  content: n.content || '',
  tags: n.tags,
  date: n.date,
  createdAt: n.created_at,
  updatedAt: n.updated_at || undefined,
});

export const notesApi = {
  // Folders
  async getFolders(accountId?: string): Promise<Folder[]> {
    const params = accountId ? `?account_id=${accountId}` : '';
    const response = await privateClient.get<FolderResponse[]>(`/notes/folders${params}`);
    return response.data.map(transformFolder);
  },

  async createFolder(data: { account_id: string; name: string }): Promise<Folder> {
    const response = await privateClient.post<FolderResponse>('/notes/folders', data);
    return transformFolder(response.data);
  },

  async updateFolder(id: string, name: string): Promise<Folder> {
    const response = await privateClient.put<FolderResponse>(`/notes/folders/${id}`, { name });
    return transformFolder(response.data);
  },

  async deleteFolder(id: string): Promise<void> {
    await privateClient.delete(`/notes/folders/${id}`);
  },

  // Notes
  async getAll(filters: {
    account_id?: string;
    folder_id?: string;
    tag?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<Note[]> {
    const params = new URLSearchParams();
    if (filters.account_id) params.append('account_id', filters.account_id);
    if (filters.folder_id) params.append('folder_id', filters.folder_id);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    const response = await privateClient.get<NoteResponse[]>(`/notes/?${params.toString()}`);
    return response.data.map(transformNote);
  },

  async getById(id: string): Promise<Note | null> {
    try {
      const response = await privateClient.get<NoteResponse>(`/notes/${id}`);
      return transformNote(response.data);
    } catch {
      return null;
    }
  },

  async create(data: {
    account_id: string;
    folder_id?: string;
    title: string;
    content?: string;
    tags?: string[];
    date: string;
  }): Promise<Note> {
    const response = await privateClient.post<NoteResponse>('/notes/', data);
    return transformNote(response.data);
  },

  async update(id: string, data: Partial<{
    folder_id: string;
    title: string;
    content: string;
    tags: string[];
  }>): Promise<Note> {
    const response = await privateClient.put<NoteResponse>(`/notes/${id}`, data);
    return transformNote(response.data);
  },

  async delete(id: string): Promise<void> {
    await privateClient.delete(`/notes/${id}`);
  },
};

export default notesApi;
