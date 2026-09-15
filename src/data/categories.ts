import { images } from '../constants';

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: number | null;
  description: string;
  productCount: number;
};

export const categories: Category[] = [
  {
    id: 'makeup',
    name: 'Makeup',
    slug: 'makeup',
    image: images.image1,
    description: 'Discover your perfect look with our curated makeup collection',
    productCount: 45,
  },
  {
    id: 'skincare',
    name: 'Skincare',
    slug: 'skincare',
    image: images.image2,
    description: 'Nourish and protect your skin with premium skincare essentials',
    productCount: 38,
  },
  {
    id: 'fragrance',
    name: 'Fragrance',
    slug: 'fragrance',
    image: images.image3,
    description: 'Find your signature scent from our luxury fragrance collection',
    productCount: 22,
  },
  {
    id: 'haircare',
    name: 'Haircare',
    slug: 'haircare',
    image: images.image4,
    description: 'Salon-quality haircare for every hair type and concern',
    productCount: 31,
  },
  {
    id: 'body-care',
    name: 'Body Care',
    slug: 'body-care',
    image: images.image1,
    description: 'Indulgent body care for silky smooth skin',
    productCount: 27,
  },
  {
    id: 'beauty-tools',
    name: 'Beauty Tools',
    slug: 'beauty-tools',
    image: images.image2,
    description: 'Professional tools to perfect your beauty routine',
    productCount: 19,
  },
];

export type Subcategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string;
};

export const subcategories: Subcategory[] = [
  { id: 'lips', name: 'Lips', slug: 'lips', parentId: 'makeup' },
  { id: 'face', name: 'Face', slug: 'face', parentId: 'makeup' },
  { id: 'eyes', name: 'Eyes', slug: 'eyes', parentId: 'makeup' },
  { id: 'nails', name: 'Nails', slug: 'nails', parentId: 'makeup' },
  { id: 'skincare', name: 'Skincare', slug: 'skincare', parentId: 'skincare' },
  { id: 'body-care', name: 'Body Care', slug: 'body-care', parentId: 'body-care' },
  { id: 'haircare', name: 'Haircare', slug: 'haircare', parentId: 'haircare' },
  { id: 'fragrance', name: 'Fragrance', slug: 'fragrance', parentId: 'fragrance' },
];
