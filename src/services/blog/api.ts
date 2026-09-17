import { apiGet } from '../../lib/api-client';
import type { BlogsApiResponse, BlogBySlugApiResponse } from '../../types/blog';

export async function fetchBlogs(limit = 10): Promise<BlogsApiResponse> {
  return apiGet<BlogsApiResponse>('/blog/fetch-all-blogs', { limit });
}

export async function fetchBlogBySlug(slug: string): Promise<BlogBySlugApiResponse> {
  return apiGet<BlogBySlugApiResponse>(`/blog/fetch-blog-by-slug/${slug}`);
}
