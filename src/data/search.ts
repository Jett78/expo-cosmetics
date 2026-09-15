export const popularSearches = [
  'Lipstick',
  'Foundation',
  'Skincare',
  'Mascara',
  'Perfume',
  'Serum',
  'Eyeshadow',
  'Moisturizer',
];

export const recentSearches = [
  'Matte lipstick',
  'Vitamin C serum',
  'Waterproof mascara',
];

export const sortOptions = [
  { id: 'recommended', name: 'Recommended' },
  { id: 'newest', name: 'Newest' },
  { id: 'price-asc', name: 'Price: Low to High' },
  { id: 'price-desc', name: 'Price: High to Low' },
  { id: 'rating', name: 'Best Rated' },
  { id: 'popular', name: 'Most Popular' },
];

export const filterOptions = {
  priceRanges: [
    { id: 'under-1000', label: 'Under Rs. 1,000', min: 0, max: 1000 },
    { id: '1000-2000', label: 'Rs. 1,000 - Rs. 2,000', min: 1000, max: 2000 },
    { id: '2000-5000', label: 'Rs. 2,000 - Rs. 5,000', min: 2000, max: 5000 },
    { id: 'above-5000', label: 'Above Rs. 5,000', min: 5000, max: Infinity },
  ],
  ratings: [
    { id: '4+', label: '4★ & above', value: 4 },
    { id: '3+', label: '3★ & above', value: 3 },
    { id: '2+', label: '2★ & above', value: 2 },
  ],
  discounts: [
    { id: 'any', label: 'Any discount' },
    { id: '10+', label: '10% or more' },
    { id: '20+', label: '20% or more' },
    { id: '30+', label: '30% or more' },
  ],
};
