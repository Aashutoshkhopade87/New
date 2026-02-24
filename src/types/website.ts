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
};

export type Website = {
  id: string;
  templateId: string;
  thumbnailUrl: string;
  status: WebsiteStatus;
  designConfig: DesignConfig;
  content: WebsiteContent;
  analytics: WebsiteAnalytics;
};
