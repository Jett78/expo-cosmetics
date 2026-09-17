import { useQuery } from '@tanstack/react-query';
import { fetchBlogs } from './api';

const BLOG_STALE_TIME = 5 * 60 * 1000;

export function useBlogs(limit = 10) {
  return useQuery({
    queryKey: ['blogs', limit],
    queryFn: () => fetchBlogs(limit),
    staleTime: BLOG_STALE_TIME,
    select: (data) => data.data.blogs,
  });
}
