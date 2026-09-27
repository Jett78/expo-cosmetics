import { useQuery } from '@tanstack/react-query';
import { fetchFaqs } from './api';

const FAQ_STALE_TIME = 5 * 60 * 1000;

export function useFaqs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: fetchFaqs,
    staleTime: FAQ_STALE_TIME,
    select: (data) =>
      data.faqs
        .filter((faq) => faq.isActive)
        .sort((a, b) => a.order - b.order)
        .map((faq) => ({ ...faq, answer: faq.answer.trim() })),
  });
}
