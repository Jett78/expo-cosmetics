import { apiGet } from '../../lib/api-client';
import type { TestimonialsApiResponse } from '../../types/testimonial';

export async function fetchTestimonials(limit = 10): Promise<TestimonialsApiResponse> {
  return apiGet<TestimonialsApiResponse>('/testimonial/fetch-all-testimonial', { limit });
}
