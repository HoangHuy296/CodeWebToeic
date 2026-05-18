import { api, unwrapResponse } from './api';
import type { BlogPost, PostPayload } from '../types/post';

export const postApi = {
  list() {
    return unwrapResponse<BlogPost[]>(api.get('/posts'));
  },
  create(payload: PostPayload) {
    return unwrapResponse<BlogPost>(api.post('/posts', payload));
  },
  update(id: string, payload: Partial<PostPayload>) {
    return unwrapResponse<BlogPost>(api.patch(`/posts/${id}`, payload));
  },
  remove(id: string) {
    return unwrapResponse<Record<string, never>>(api.delete(`/posts/${id}`));
  },
};
