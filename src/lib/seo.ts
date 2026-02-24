const SITE_URL = 'https://tezweb.com';

type SeoInput = {
  title: string;
  description: string;
  image?: string;
  url?: string;
  robots?: string;
};

function upsertMetaByName(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertMetaByProperty(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function applySeo({ title, description, image, url, robots = 'index,follow' }: SeoInput) {
  document.title = title;

  const canonicalUrl = url ?? SITE_URL;
  const ogImage = image ?? `${SITE_URL}/og-default.png`;

  upsertMetaByName('description', description);
  upsertMetaByName('robots', robots);
  upsertMetaByProperty('og:type', 'website');
  upsertMetaByProperty('og:title', title);
  upsertMetaByProperty('og:description', description);
  upsertMetaByProperty('og:url', canonicalUrl);
  upsertMetaByProperty('og:image', ogImage);
  upsertMetaByName('twitter:card', 'summary_large_image');
  upsertMetaByName('twitter:title', title);
  upsertMetaByName('twitter:description', description);
  upsertMetaByName('twitter:image', ogImage);

  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;
}
