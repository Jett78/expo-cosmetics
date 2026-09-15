export type Brand = {
  id: string;
  name: string;
  tagline: string;
  productCount: number;
};

export const brands: Brand[] = [
  {
    id: 'luxe-beauty',
    name: 'Luxe Beauty',
    tagline: 'Luxury redefined',
    productCount: 24,
  },
  {
    id: 'velvet-glow',
    name: 'Velvet Glow',
    tagline: 'Glow from within',
    productCount: 19,
  },
  {
    id: 'pureskin',
    name: 'PureSkin',
    tagline: 'Nature meets science',
    productCount: 16,
  },
  {
    id: 'noir',
    name: 'Noir',
    tagline: 'Embrace the dark',
    productCount: 12,
  },
  {
    id: 'bloom',
    name: 'Bloom',
    tagline: 'Blossom beautifully',
    productCount: 21,
  },
  {
    id: 'crystal',
    name: 'Crystal',
    tagline: 'Clarity in beauty',
    productCount: 14,
  },
];
