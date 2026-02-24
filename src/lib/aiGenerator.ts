import { generateDesignConfig } from './designGenerator';
import type { CreateWebsiteInput, Website } from '../types/website';

const heroImages = [
  'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1515165562835-c4c8b8c92a2b?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80',
];

const taglines = [
  'No coding needed. WhatsApp powered websites.',
  'Local business, digital growth, more orders.',
  'Made for Indian shop owners and creators.',
  'Fast setup, modern design, better conversion.',
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generateAiWebsite(input: CreateWebsiteInput, templateId: string): Website {
  const seed = `${input.businessName}-${templateId}-${Date.now()}`;
  const seedHash = hash(seed);
  const hero = heroImages[seedHash % heroImages.length];
  const second = heroImages[(seedHash + 2) % heroImages.length];
  const whatsapp = `${input.countryCode}${input.whatsappNumber.replace(/\D/g, '')}`;
  const slug = `${slugify(input.businessName)}-${Date.now().toString(36).slice(-4)}`;

  return {
    id: `local-${Date.now()}`,
    templateId,
    thumbnailUrl: hero,
    status: 'draft',
    slug,
    publishedPath: `/site/${slug}`,
    designConfig: generateDesignConfig(seed, templateId),
    analytics: { views: 0, whatsappClicks: 0, productClicks: 0 },
    content: {
      businessName: input.businessName,
      category: input.businessCategory,
      language: input.language,
      whatsapp,
      additionalInstructions: input.additionalInstructions,
      heroImage: hero,
      tagline: taglines[seedHash % taglines.length],
      products: ['Best Seller', 'Top Offer', 'Premium Service'],
      gallery: [hero, second],
      socialLinks: { instagram: '#', facebook: '#', youtube: '#' },
      about: `${input.businessName} is a trusted ${input.businessCategory.toLowerCase()} serving customers with quality and care.`,
      locationLabel: 'Main Branch',
      mapEmbedUrl: 'https://maps.google.com',
      contactEmail: `hello@${slugify(input.businessName)}.in`,
    },
  };
}
