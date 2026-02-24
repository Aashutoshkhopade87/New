import { useEffect, useState } from 'react';
import { WebsiteLivePreview } from '../components/WebsiteLivePreview';
import { resolvePublishedWebsite, resolvePublishedWebsiteBySlug } from '../services/firestoreService';
import { applySeo } from '../lib/seo';
import type { Website } from '../types/website';

type PublishedWebsitePageProps = {
  subdomain?: string;
  slug?: string;
};

export function PublishedWebsitePage({ subdomain, slug }: PublishedWebsitePageProps) {
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublishedSite() {
      const resolved = subdomain
        ? await resolvePublishedWebsite(subdomain)
        : slug
          ? await resolvePublishedWebsiteBySlug(slug)
          : null;
      setWebsite(resolved);
      setLoading(false);
    }

    void loadPublishedSite();
  }, [slug, subdomain]);

  useEffect(() => {
    if (!website) return;
    const businessName = website.content.businessName || 'TezWeb Website';

    applySeo({
      title: `${businessName} | TezWeb`,
      description: website.content.tagline || 'Published with TezWeb',
      url: website.subdomain ? `https://${website.subdomain}.tezweb.com` : `https://tezweb.com/site/${website.slug}`,
      image: website.thumbnailUrl,
      robots: 'index,follow',
    });
  }, [website]);

  if (loading) return <main className="min-h-screen bg-slate-950 p-6 text-slate-100">Loading published website...</main>;
  if (!website) return <main className="min-h-screen bg-slate-950 p-6 text-slate-100">Published website not found.</main>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="glass-card mb-4 p-4 text-sm text-slate-200">
          Live site:{' '}
          <span className="font-semibold text-cyan-200">
            {website.subdomain ? `${website.subdomain}.tezweb.com` : `tezweb.com/site/${website.slug}`}
          </span>
        </div>
        <WebsiteLivePreview designConfig={website.designConfig} content={website.content} />
      </div>
    </main>
  );
}
