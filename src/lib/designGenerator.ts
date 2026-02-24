import type { ColorPalette, DesignConfig, FontPair, HeroStyle, LayoutStyle, SectionKey } from '../types/design';

const heroStyles: HeroStyle[] = ['minimal', 'split-image', 'gradient-spotlight', 'boxed'];
const layoutStyles: LayoutStyle[] = ['classic', 'editorial', 'cards', 'clean-grid'];

const colorPalettes: ColorPalette[] = [
  {
    id: 'sunset-pop',
    name: 'Sunset Pop',
    primary: '#FF5A5F',
    secondary: '#FFB400',
    accent: '#2EC4B6',
    background: '#FFF8F0',
    text: '#1F2937',
  },
  {
    id: 'ocean-tech',
    name: 'Ocean Tech',
    primary: '#2563EB',
    secondary: '#0EA5E9',
    accent: '#14B8A6',
    background: '#F0F9FF',
    text: '#0F172A',
  },
  {
    id: 'forest-earth',
    name: 'Forest Earth',
    primary: '#166534',
    secondary: '#65A30D',
    accent: '#D97706',
    background: '#F7FEE7',
    text: '#1C1917',
  },
  {
    id: 'violet-neo',
    name: 'Violet Neo',
    primary: '#7C3AED',
    secondary: '#A855F7',
    accent: '#EC4899',
    background: '#FAF5FF',
    text: '#111827',
  },
];

const fontPairs: FontPair[] = [
  { id: 'inter-poppins', heading: 'Poppins', body: 'Inter' },
  { id: 'montserrat-lato', heading: 'Montserrat', body: 'Lato' },
  { id: 'spacegrotesk-manrope', heading: 'Space Grotesk', body: 'Manrope' },
  { id: 'dmserif-opensans', heading: 'DM Serif Display', body: 'Open Sans' },
];

const fixedSectionOrder: SectionKey[] = [
  'aiHero',
  'businessIdentity',
  'socialIcons',
  'products',
  'gallery',
  'about',
  'locationMap',
  'whatsapp',
  'contact',
];

function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: string) {
  let state = hashString(seed);

  return function seededRandom() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pick<T>(collection: T[], random: () => number): T {
  const index = Math.floor(random() * collection.length);
  return collection[index];
}

export function generateDesignConfig(seed: string, templateId: string): DesignConfig {
  const random = createSeededRandom(seed);

  return {
    seed,
    templateId,
    heroStyle: pick(heroStyles, random),
    palette: pick(colorPalettes, random),
    fonts: pick(fontPairs, random),
    layout: pick(layoutStyles, random),
    sectionOrder: [...fixedSectionOrder],
  };
}
