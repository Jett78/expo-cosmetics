import { images } from '../constants';

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image: number;
  buttonText: string;
  accentColor: string;
};

export const heroBanners: Banner[] = [
  {
    id: 'summer-glow',
    title: 'Summer Glow Collection',
    subtitle: 'Get radiant skin this season',
    image: images.bigBanner,
    buttonText: 'Shop Now',
    accentColor: '#C4876E',
  },
  {
    id: 'new-arrivals',
    title: 'New Arrivals',
    subtitle: 'Fresh beauty essentials',
    image: images.visualBanner,
    buttonText: 'Explore',
    accentColor: '#8B2252',
  },
  {
    id: 'luxury-skincare',
    title: 'Luxury Skincare',
    subtitle: 'Transform your routine',
    image: images.image4,
    buttonText: 'Discover',
    accentColor: '#6B8E6B',
  },
];

export const categoryBanner = {
  title: 'BEAUTY SALE',
  subtitle: 'Up to 40% off',
};
