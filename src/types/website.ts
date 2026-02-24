import type { DesignConfig } from './design';

export type WebsiteStatus = 'draft' | 'published';

export type WebsiteAnalytics = {
  views: number;
  whatsappClicks: number;
  productClicks: number;
};

export type WebsiteContent = {
  businessName: string;
  tagline: string;
  about: string;
  contactEmail: string;
  whatsapp: string;
  products: string[];
  category?: string;
  language?: 'English' | 'Hindi' | 'Marathi';
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  gallery?: string[];
  locationLabel?: string;
  mapEmbedUrl?: string;
  additionalInstructions?: string;
  heroImage?: string;
};

export type Website = {
  id: string;
  templateId: string;
  thumbnailUrl: string;
  status: WebsiteStatus;
  subdomain?: string;
  slug?: string;
  publishedPath?: string;
  designConfig: DesignConfig;
  content: WebsiteContent;
  analytics: WebsiteAnalytics;
};

export type CreateWebsiteInput = {
  businessName: string;
  businessCategory: string;
  whatsappNumber: string;
  countryCode: string;
  language: 'English' | 'Hindi' | 'Marathi';
  additionalInstructions: string;
};
