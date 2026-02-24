import { useEffect, useState } from 'react';
import { WebsiteLivePreview } from '../components/WebsiteLivePreview';
import { resolvePublishedWebsite } from '../services/firestoreService';
import type { Website } from '../types/website';

type PublishedWebsitePageProps = {
  subdomain: string;
};

export function PublishedWebsitePage({ subdomain }: PublishedWebsitePageProps) {
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublishedSite() {
      const resolved = await resolvePublishedWebsite(subdomain);
      setWebsite(resolved);
      setLoading(false);
    }

    void loadPublishedSite();
  }, [subdomain]);

  if (loading) {
    return <main className="min-h-screen p-6">Loading published website...</main>;
  }

  if (!website) {
    return <main className="min-h-screen p-6">Published website not found.</main>;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">
          Live site: <span className="font-semibold">{website.subdomain}.tezweb.com</span>
        </div>
        <WebsiteLivePreview designConfig={website.designConfig} content={website.content} />
      </div>
    </main>
  );
}
