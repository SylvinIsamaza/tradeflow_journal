import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/lib/api/notes';

export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (filters: any) => [...noteKeys.lists(), filters] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
  folders: ['folders'] as const,
  folderList: (accountId?: string) => [...noteKeys.folders, accountId] as const,
};

// Folders
export function useFolders(accountId?: string) {
  return useQuery({
    queryKey: noteKeys.folderList(accountId),
    queryFn: () => notesApi.getFolders(accountId),
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesApi.createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.folders });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => notesApi.updateFolder(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.folders });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesApi.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.folders });
    },
  });
}

// Notes
export function useNotes(filters: {
  account_id?: string;
  folder_id?: string;
  tag?: string;
  start_date?: string;
  end_date?: string;
} = {}) {
  return useQuery({
    queryKey: noteKeys.list(filters),
    queryFn: () => notesApi.getAll(filters),
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => notesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => notesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}
