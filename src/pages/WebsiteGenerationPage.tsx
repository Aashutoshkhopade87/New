import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { generateDesignConfig } from '../lib/designGenerator';
import type { DesignConfig, SectionKey } from '../types/design';
import { saveDesignConfig } from '../services/firestoreService';
import { applySeo } from '../lib/seo';

type WebsiteGenerationPageProps = {
  user: User;
  templateId: string;
};

const sectionLabels: Record<SectionKey, string> = {
  aiHero: 'AI Hero',
  businessIdentity: 'Business name + tagline',
  socialIcons: 'Social icons',
  products: 'Products',
  gallery: 'Gallery',
  about: 'About',
  locationMap: 'Location + Google Map',
  whatsapp: 'WhatsApp',
  contact: 'Contact',
};

export function WebsiteGenerationPage({ user, templateId }: WebsiteGenerationPageProps) {
  useEffect(() => {
    applySeo({
      title: 'Website Generation | TezWeb',
      description: 'Generate and save seeded design configuration for your website.',
      url: 'https://tezweb.com/dashboard',
      robots: 'noindex,nofollow',
    });
  }, []);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const designConfig = useMemo<DesignConfig>(() => {
    const seed = `${user.uid}:${templateId}`;
    return generateDesignConfig(seed, templateId);
  }, [user.uid, templateId]);

  async function handleSave() {
    setSaving(true);
    setMessage('');

    try {
      await saveDesignConfig(user.uid, designConfig);
      setMessage('Design config generated and saved to Firestore.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto mt-6 w-full max-w-6xl rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Website Generation Module</h2>
          <p className="mt-1 text-sm text-slate-600">Seeded style system for predictable and repeatable design output.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? 'Saving...' : 'Save designConfig'}
        </button>
      </div>

      {message && <p className="mt-3 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Generated Style</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li><strong>Seed:</strong> {designConfig.seed}</li>
            <li><strong>Hero banner:</strong> {designConfig.heroStyle}</li>
            <li><strong>Palette:</strong> {designConfig.palette.name}</li>
            <li><strong>Fonts:</strong> {designConfig.fonts.heading} / {designConfig.fonts.body}</li>
            <li><strong>Layout:</strong> {designConfig.layout}</li>
          </ul>
          <div className="mt-3 flex gap-2">
            {[designConfig.palette.primary, designConfig.palette.secondary, designConfig.palette.accent].map((color) => (
              <span key={color} className="h-7 w-7 rounded-full border border-slate-200" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Section Order</h3>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
            {designConfig.sectionOrder.map((section) => (
              <li key={section}>{sectionLabels[section]}</li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-slate-500">Booking forms removed from generation scope.</p>
        </div>
      </div>
    </section>
  );
}
