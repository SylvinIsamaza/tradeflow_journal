import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/lib/api/comments';
import { CommentType } from '@/types';

export const commentKeys = {
  all: ['comments'] as const,
  byDate: (accountId: string, date: string) => [...commentKeys.all, accountId, date] as const,
};

export function useCommentsByDate(accountId: string, date: string, enabled = true) {
  return useQuery({
    queryKey: commentKeys.byDate(accountId, date),
    queryFn: () => commentsApi.getCommentsByDate(accountId, date),
    enabled: enabled && !!accountId && !!date,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      account_id: string;
      content: string;
      comment_type: CommentType;
      date: string;
    }) => commentsApi.createComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: commentKeys.byDate(variables.account_id, variables.date) 
      });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentsApi.updateComment(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}
