type ResolvedLink = {
  route: string;
  params?: Record<string, string>;
};

export function resolveBannerLink(buttonLink: string): ResolvedLink {
  try {
    const url = new URL(buttonLink);
    const query = url.searchParams.get('query');
    const brandId = url.searchParams.get('brandId');

    if (query) {
      return { route: '/(tabs)/search', params: { query } };
    }

    if (brandId) {
      return { route: '/(tabs)/search', params: { brandId } };
    }

    return { route: '/(tabs)' };
  } catch {
    return { route: '/(tabs)' };
  }
}
