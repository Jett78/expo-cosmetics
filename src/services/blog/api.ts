import { apiGet } from '../../lib/api-client';
import type { BlogsApiResponse } from '../../types/blog';

export async function fetchBlogs(limit = 10): Promise<BlogsApiResponse> {
  return apiGet<BlogsApiResponse>('/blog/fetch-all-blogs', { limit });
}
