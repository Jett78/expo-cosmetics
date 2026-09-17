import { useQuery } from '@tanstack/react-query';
import { fetchTestimonials } from './api';

const TESTIMONIAL_STALE_TIME = 5 * 60 * 1000;

export function useTestimonials(limit = 10) {
  return useQuery({
    queryKey: ['testimonials', limit],
    queryFn: () => fetchTestimonials(limit),
    staleTime: TESTIMONIAL_STALE_TIME,
    select: (data) => data.testimonials.testimonials,
  });
}
