import { api, unwrapResponse } from './api';
import type { MessageRecipient, SupportMessage } from '../types/message';

export const messageApi = {
  list() {
    return unwrapResponse<SupportMessage[]>(api.get('/messages'));
  },
  recipients() {
    return unwrapResponse<MessageRecipient[]>(api.get('/messages/recipients'));
  },
  sendInternal(payload: { recipientUserId: string; subject: string; content: string }) {
    return unwrapResponse<SupportMessage>(api.post('/messages/internal', payload));
  },
  markRead(id: string, status: 'read' | 'replied') {
    return unwrapResponse<SupportMessage>(api.patch(`/messages/${id}/read`, { status }));
  },
};
