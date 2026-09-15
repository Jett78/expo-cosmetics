export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  helpful: number;
};

export const reviews: Review[] = [
  {
    id: 'r1',
    productId: 'velvet-matte-lipstick',
    author: 'Priya S.',
    rating: 5,
    date: '2024-01-15',
    title: 'Absolutely love this lipstick!',
    comment: 'The color payoff is incredible and it lasts all day. My new favorite lipstick. The matte finish looks so elegant.',
    helpful: 24,
  },
  {
    id: 'r2',
    productId: 'velvet-matte-lipstick',
    author: 'Anita M.',
    rating: 4,
    date: '2024-01-10',
    title: 'Great color, slightly drying',
    comment: 'Beautiful shade and stays on for hours. Could be a bit more moisturizing though.',
    helpful: 18,
  },
  {
    id: 'r3',
    productId: 'velvet-matte-lipstick',
    author: 'Kavya R.',
    rating: 5,
    date: '2024-01-08',
    title: 'Perfect for special occasions',
    comment: 'This lipstick is perfect for weddings and parties. The velvet finish is stunning.',
    helpful: 12,
  },
  {
    id: 'r4',
    productId: 'sky-high-mascara',
    author: 'Deepa L.',
    rating: 5,
    date: '2024-01-12',
    title: 'Best mascara I have ever used',
    comment: 'My lashes look so long and voluminous. No clumping at all!',
    helpful: 31,
  },
  {
    id: 'r5',
    productId: 'hydra-glow-serum',
    author: 'Meera K.',
    rating: 5,
    date: '2024-01-14',
    title: 'My skin loves this serum',
    comment: 'After just one week, my skin looks so much more radiant. The texture is lightweight and absorbs quickly.',
    helpful: 27,
  },
  {
    id: 'r6',
    productId: 'hydra-glow-serum',
    author: 'Riya P.',
    rating: 4,
    date: '2024-01-11',
    title: 'Good serum for the price',
    comment: 'Noticeable improvement in hydration. Will repurchase.',
    helpful: 15,
  },
];
