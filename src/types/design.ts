export type HeroStyle = 'minimal' | 'split-image' | 'gradient-spotlight' | 'boxed';

export type ColorPalette = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
};

export type FontPair = {
  id: string;
  heading: string;
  body: string;
};

export type LayoutStyle = 'classic' | 'editorial' | 'cards' | 'clean-grid';

export type SectionKey =
  | 'aiHero'
  | 'businessIdentity'
  | 'socialIcons'
  | 'products'
  | 'gallery'
  | 'about'
  | 'locationMap'
  | 'whatsapp'
  | 'contact';

export type DesignConfig = {
  seed: string;
  templateId: string;
  heroStyle: HeroStyle;
  palette: ColorPalette;
  fonts: FontPair;
  layout: LayoutStyle;
  sectionOrder: SectionKey[];
};
