import { CommentType } from '@/types';
import { privateClient } from './axios';

export const commentsApi = {
  async createComment(data: {
    account_id: string;
    content: string;
    comment_type: CommentType;
    date: string;
  }) {
    const payload: any = {
      account_id: data.account_id,
      content: data.content,
      comment_type: data.comment_type,
    };
    
    // Only include date if it's for daily/weekly comments
    if (data.comment_type === 'daily' || data.comment_type === 'weekly') {
      payload.date = data.date.split('T')[0];
    }
    
    const response = await privateClient.post('/comments', payload);
    return response.data;
  },

  async updateComment(commentId: string, data: { content: string }) {
    const response = await privateClient.put(`/comments/${commentId}`, data);
    return response.data;
  },

  async getCommentsByDate(accountId: string, date: string) {
    const response = await privateClient.get(`/comments`, {
      params: { account_id: accountId, date }
    });
    return response.data;
  },

  async deleteComment(commentId: string) {
    const response = await privateClient.delete(`/comments/${commentId}`);
    return response.data;
  },
};
