import { useQuery } from '@tanstack/react-query';
import { fetchBlogs, fetchBlogBySlug } from './api';

const BLOG_STALE_TIME = 5 * 60 * 1000;

export function useBlogs(limit = 10) {
  return useQuery({
    queryKey: ['blogs', limit],
    queryFn: () => fetchBlogs(limit),
    staleTime: BLOG_STALE_TIME,
    select: (data) => data.data.blogs,
  });
}

export function useBlogBySlug(slug: string) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => fetchBlogBySlug(slug),
    staleTime: BLOG_STALE_TIME,
    enabled: !!slug,
    select: (data) => ({
      blog: data.blog,
      imageLink: data.imageLink,
    }),
  });
}
