export type SiteSetting = {
  id: string;
  siteName: string;
  siteDescription: string;
  defaultLanguage: string;
  faviconUrl: string | null;
  logoUrl: string | null;
  footerLogoUrl: string | null;
  contactEmail: string | null;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  address: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  googleMap: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiSiteSettingResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  setting: SiteSetting;
};
