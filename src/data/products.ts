import { images } from '../constants';

export type Shade = {
  id: string;
  name: string;
  hex: string;
};

export type Size = {
  id: string;
  label: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  brandId: string;
  category: string;
  categoryId: string;
  price: number;
  salePrice?: number;
  currency?: string;
  image: number;
  images: number[];
  description: string;
  ingredients?: string;
  howToUse?: string;
  rating: number;
  reviewCount: number;
  shades?: Shade[];
  sizes?: Size[];
  tags: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
};

export const products: Product[] = [
  {
    id: 'velvet-matte-lipstick',
    name: 'Velvet Matte Lipstick',
    brand: 'Luxe Beauty',
    brandId: 'luxe-beauty',
    category: 'Lips',
    categoryId: 'lips',
    price: 1299,
    salePrice: 999,
    currency: 'Rs.',
    image: images.product1,
    images: [images.product1, images.product2, images.product3],
    description:
      'Indulge in rich, long-lasting color with our Velvet Matte Lipstick. Formulated with hydrating ingredients, it delivers intense pigmentation without drying your lips. The creamy texture glides on smoothly and sets to a luxurious matte finish that lasts up to 8 hours.',
    ingredients: 'Ricinus Communis Seed Oil, Caprylic/Capric Triglyceride, Silica, Candelilla Wax, Tocopheryl Acetate, Vitamin E',
    howToUse: 'Apply directly to lips starting from the center and gliding outward. For a precise application, use a lip brush. Reapply as needed throughout the day.',
    rating: 4.8,
    reviewCount: 324,
    shades: [
      { id: 'red-velvet', name: 'Red Velvet', hex: '#C41E3A' },
      { id: 'rose-petal', name: 'Rose Petal', hex: '#E8A0BF' },
      { id: 'nude-blush', name: 'Nude Blush', hex: '#D4A5A5' },
      { id: 'berry-wine', name: 'Berry Wine', hex: '#722F37' },
      { id: 'coral-queen', name: 'Coral Queen', hex: '#FF6F61' },
    ],
    tags: ['lipstick', 'matte', 'long-lasting', 'bestseller'],
    isBestSeller: true,
    isFeatured: true,
  },
  {
    id: 'radiant-glow-foundation',
    name: 'Radiant Glow Foundation',
    brand: 'Luxe Beauty',
    brandId: 'luxe-beauty',
    category: 'Face',
    categoryId: 'face',
    price: 2499,
    currency: 'Rs.',
    image: images.product2,
    images: [images.product2, images.product1, images.product3],
    description:
      'Achieve a flawless, luminous complexion with our Radiant Glow Foundation. This buildable formula provides medium to full coverage while letting your natural skin shine through. Infused with hyaluronic acid for all-day hydration.',
    ingredients: 'Aqua, Glycerin, Hyaluronic Acid, Niacinamide, Squalane, Vitamin C',
    howToUse: 'Apply a small amount to the center of the face and blend outward using a brush or sponge. Build coverage as desired.',
    rating: 4.6,
    reviewCount: 198,
    sizes: [
      { id: '30ml', label: '30ml', price: 2499 },
      { id: '50ml', label: '50ml', price: 3499 },
    ],
    tags: ['foundation', 'glow', 'hydrating', 'new'],
    isNew: true,
    isFeatured: true,
  },
  {
    id: 'sky-high-mascara',
    name: 'Sky High Mascara',
    brand: 'Velvet Glow',
    brandId: 'velvet-glow',
    category: 'Eyes',
    categoryId: 'eyes',
    price: 899,
    currency: 'Rs.',
    image: images.product3,
    images: [images.product3, images.product1, images.product2],
    description:
      'Get voluminous, sky-high lashes with our iconic mascara. The unique fiber brush coats every lash from root to tip, delivering dramatic length and volume without clumping.',
    ingredients: 'Beeswax, Carnauba Wax, Panthenol, Biotin, Rice Bran Wax',
    howToUse: 'Wiggle the brush at the base of lashes and sweep upward to the tips. Apply multiple coats for extra volume.',
    rating: 4.9,
    reviewCount: 567,
    tags: ['mascara', 'volume', 'length', 'bestseller'],
    isBestSeller: true,
  },
  {
    id: 'hydra-glow-serum',
    name: 'Hydra Glow Serum',
    brand: 'PureSkin',
    brandId: 'pureskin',
    category: 'Skincare',
    categoryId: 'skincare',
    price: 1899,
    salePrice: 1499,
    currency: 'Rs.',
    image: images.product1,
    images: [images.product1, images.product2, images.product3],
    description:
      'Transform your skin with our Hydra Glow Serum. Packed with hyaluronic acid and vitamin C, this lightweight serum penetrates deep into the skin to deliver intense hydration and a radiant glow.',
    ingredients: 'Hyaluronic Acid, Vitamin C, Niacinamide, Centella Asiatica Extract, Green Tea Extract',
    howToUse: 'Apply 2-3 drops to clean, damp skin before moisturizer. Use morning and evening for best results.',
    rating: 4.7,
    reviewCount: 412,
    tags: ['serum', 'hydration', 'glow', 'skincare', 'featured'],
    isFeatured: true,
  },
  {
    id: 'noir-eau-de-parfum',
    name: 'Noir Eau de Parfum',
    brand: 'Noir',
    brandId: 'noir',
    category: 'Fragrance',
    categoryId: 'fragrance',
    price: 4999,
    currency: 'Rs.',
    image: images.product2,
    images: [images.product2, images.product3, images.product1],
    description:
      'A sophisticated blend of black orchid, vanilla, and sandalwood. This enchanting fragrance captivates with its deep, mysterious notes that linger throughout the day.',
    ingredients: 'Alcohol Denat., Parfum, Aqua, Linalool, Limonene, Coumarin',
    howToUse: 'Spray on pulse points - wrists, neck, and behind ears. Avoid rubbing to preserve the fragrance notes.',
    rating: 4.5,
    reviewCount: 156,
    sizes: [
      { id: '30ml', label: '30ml', price: 4999 },
      { id: '50ml', label: '50ml', price: 7999 },
      { id: '100ml', label: '100ml', price: 11999 },
    ],
    tags: ['perfume', 'fragrance', 'luxury'],
    isFeatured: true,
  },
  {
    id: 'rose-mist-toner',
    name: 'Rose Mist Toner',
    brand: 'Bloom',
    brandId: 'bloom',
    category: 'Skincare',
    categoryId: 'skincare',
    price: 799,
    currency: 'Rs.',
    image: images.product3,
    images: [images.product3, images.product1, images.product2],
    description:
      'Refresh and prep your skin with our luxurious Rose Mist Toner. Made with real rose water, it helps balance pH, minimize pores, and create the perfect canvas for your skincare routine.',
    ingredients: 'Rosa Damascena Flower Water, Glycerin, Hyaluronic Acid, Aloe Vera Extract',
    howToUse: 'Mist generously over clean skin before applying serums or moisturizers. Can also be used to set makeup.',
    rating: 4.4,
    reviewCount: 289,
    tags: ['toner', 'rose', 'skincare', 'refreshing'],
  },
  {
    id: 'silk-eyeshadow-palette',
    name: 'Silk Eyeshadow Palette',
    brand: 'Velvet Glow',
    brandId: 'velvet-glow',
    category: 'Eyes',
    categoryId: 'eyes',
    price: 1999,
    salePrice: 1699,
    currency: 'Rs.',
    image: images.product1,
    images: [images.product1, images.product3, images.product2],
    description:
      'Create stunning eye looks with our Silk Eyeshadow Palette. Features 12 buttery-smooth shades ranging from everyday neutrals to bold shimmers. Ultra-blendable and long-lasting.',
    ingredients: 'Talc, Mica, Magnesium Stearate, Dimethicone, Tocopheryl Acetate',
    howToUse: 'Apply with fingers or brushes. Use lighter shades on the lid and darker shades in the crease for dimension.',
    rating: 4.6,
    reviewCount: 234,
    tags: ['eyeshadow', 'palette', 'eyes', 'new'],
    isNew: true,
  },
  {
    id: 'vitamin-c-moisturizer',
    name: 'Vitamin C Moisturizer',
    brand: 'PureSkin',
    brandId: 'pureskin',
    category: 'Skincare',
    categoryId: 'skincare',
    price: 1299,
    currency: 'Rs.',
    image: images.product2,
    images: [images.product2, images.product1, images.product3],
    description:
      'Brighten and protect your skin with our Vitamin C Moisturizer. This lightweight cream provides 24-hour hydration while fighting dark spots and environmental damage.',
    ingredients: 'Vitamin C, Vitamin E, Shea Butter, Jojoba Oil, SPF 30',
    howToUse: 'Apply to clean face and neck after serum. Use morning and evening. For daytime, follow with sunscreen.',
    rating: 4.3,
    reviewCount: 178,
    tags: ['moisturizer', 'vitamin-c', 'brightening', 'skincare'],
  },
  {
    id: 'precision-liner',
    name: 'Precision Liquid Liner',
    brand: 'Luxe Beauty',
    brandId: 'luxe-beauty',
    category: 'Eyes',
    categoryId: 'eyes',
    price: 699,
    currency: 'Rs.',
    image: images.product3,
    images: [images.product3, images.product2, images.product1],
    description:
      'Create precise, dramatic eye looks with our ultra-fine tip liquid liner. Waterproof and smudge-proof formula that lasts all day without fading.',
    ingredients: 'Aqua, Carbon Black, Acrylates Copolymer, Propylene Glycol',
    howToUse: 'Start from the inner corner and draw a thin line along the lash line. Build thickness gradually. For a wing, extend outward and upward.',
    rating: 4.7,
    reviewCount: 445,
    tags: ['eyeliner', 'liquid', 'waterproof', 'bestseller'],
    isBestSeller: true,
  },
  {
    id: 'body-butter-shea',
    name: 'Shea Body Butter',
    brand: 'Crystal',
    brandId: 'crystal',
    category: 'Body Care',
    categoryId: 'body-care',
    price: 899,
    currency: 'Rs.',
    image: images.product1,
    images: [images.product1, images.product2, images.product3],
    description:
      'Pamper your skin with our ultra-rich Shea Body Butter. Made with 100% organic shea butter, it melts into skin to deliver deep, long-lasting moisture.',
    ingredients: 'Butyrospermum Parkii Butter, Coconut Oil, Sweet Almond Oil, Vitamin E, Vanilla Extract',
    howToUse: 'Apply generously to damp skin after shower. Massage in circular motions until fully absorbed.',
    rating: 4.8,
    reviewCount: 367,
    tags: ['body-butter', 'shea', 'moisturizing', 'body-care'],
    isBestSeller: true,
  },
  {
    id: 'blush-serum',
    name: 'Cheek Glow Blush',
    brand: 'Bloom',
    brandId: 'bloom',
    category: 'Face',
    categoryId: 'face',
    price: 999,
    currency: 'Rs.',
    image: images.product2,
    images: [images.product2, images.product3, images.product1],
    description:
      'Get a natural, healthy flush with our Cheek Glow Blush. This buildable powder blush blends seamlessly and stays put for hours.',
    ingredients: 'Mica, Talc, Boron Nitride, Lauroyl Lysine, Tocopheryl Acetate',
    howToUse: 'Smile and apply to the apples of your cheeks. Blend upward toward the temples with a fluffy brush.',
    rating: 4.5,
    reviewCount: 198,
    shades: [
      { id: 'peach-glow', name: 'Peach Glow', hex: '#FFDAB9' },
      { id: 'rose-blush', name: 'Rose Blush', hex: '#FFB6C1' },
      { id: 'berry-pop', name: 'Berry Pop', hex: '#C7688B' },
    ],
    tags: ['blush', 'face', 'natural-glow'],
    isNew: true,
  },
  {
    id: 'gold-shimmer-highlighter',
    name: 'Gold Shimmer Highlighter',
    brand: 'Velvet Glow',
    brandId: 'velvet-glow',
    category: 'Face',
    categoryId: 'face',
    price: 1199,
    currency: 'Rs.',
    image: images.product3,
    images: [images.product3, images.product1, images.product2],
    description:
      'Illuminate your features with our Gold Shimmer Highlighter. This finely milled powder creates a stunning, lit-from-within glow without looking glittery.',
    ingredients: 'Mica, Silica, Boron Nitride, Gold Powder, Vitamin E',
    howToUse: 'Apply to high points of the face - cheekbones, bridge of nose, cupid\'s bow, and brow bone.',
    rating: 4.6,
    reviewCount: 287,
    shades: [
      { id: 'champagne', name: 'Champagne', hex: '#F7E7CE' },
      { id: 'rose-gold', name: 'Rose Gold', hex: '#B76E79' },
      { id: 'pearl', name: 'Pearl', hex: '#F0EAD6' },
    ],
    tags: ['highlighter', 'shimmer', 'glow', 'face'],
    isFeatured: true,
  },
];
