import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import type { DesignConfig } from '../types/design';
import type { UserProfile } from '../types/template';
import type { Website, WebsiteContent } from '../types/website';
import {
  createWebsite,
  deleteWebsite,
  listWebsites,
  publishWebsite,
  updateWebsite,
} from '../services/firestoreService';
import { WebsiteLivePreview } from '../components/WebsiteLivePreview';

type DashboardPageProps = {
  user: User;
  profile: UserProfile;
};

const initialContent: WebsiteContent = {
  businessName: '',
  tagline: '',
  about: '',
  contactEmail: '',
  whatsapp: '',
  products: ['Product 1', 'Product 2'],
};

export function DashboardPage({ user, profile }: DashboardPageProps) {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [activeWebsite, setActiveWebsite] = useState<Website | null>(null);
  const [draftContent, setDraftContent] = useState<WebsiteContent>(initialContent);
  const [message, setMessage] = useState('');

  const designConfig = profile.designConfig;

  useEffect(() => {
    async function loadWebsites() {
      const items = await listWebsites(user.uid);
      setWebsites(items);
    }

    void loadWebsites();
  }, [user.uid]);

  function onEdit(website: Website) {
    setActiveWebsite(website);
    setDraftContent(website.content);
    setMessage('Editing website with live preview.');
  }

  async function onCreate() {
    if (!designConfig || !profile.templateId) {
      setMessage('Generate and save a design config first.');
      return;
    }

    const created = await createWebsite(user.uid, {
      designConfig,
      templateId: profile.templateId,
      content: initialContent,
    });
    setWebsites((prev) => [created, ...prev]);
    setActiveWebsite(created);
    setDraftContent(created.content);
  }

  async function onSaveEdit() {
    if (!activeWebsite) {
      return;
    }

    const updated = await updateWebsite(user.uid, activeWebsite.id, { content: draftContent });
    setWebsites((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setActiveWebsite(updated);
    setMessage('Website saved.');
  }

  async function onDelete(id: string) {
    await deleteWebsite(user.uid, id);
    setWebsites((prev) => prev.filter((item) => item.id !== id));
    if (activeWebsite?.id === id) {
      setActiveWebsite(null);
      setDraftContent(initialContent);
    }
  }

  async function onPublish(id: string) {
    const updated = await publishWebsite(user.uid, id);
    setWebsites((prev) => prev.map((item) => (item.id === id ? updated : item)));
  }

  const previewConfig: DesignConfig | undefined = activeWebsite?.designConfig || designConfig;
  const previewContent = activeWebsite ? draftContent : initialContent;

  const previewWebsite = useMemo(() => websites[0] ?? null, [websites]);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Website Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Manage website drafts, publish status, and edit with live preview.</p>
          <button onClick={onCreate} type="button" className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Create Website</button>
          {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
        </header>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Websites</h2>
            <div className="space-y-3">
              {websites.length === 0 && <p className="text-sm text-slate-500">No websites yet. Create your first website.</p>}
              {websites.map((site) => (
                <article key={site.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-3">
                    <img src={site.thumbnailUrl} alt="thumbnail" className="h-16 w-24 rounded-md object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{site.content.businessName || 'Untitled Website'}</p>
                      <p className="text-xs text-slate-500">Status: {site.status}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => onEdit(site)} className="rounded-md border px-3 py-1 text-xs">Edit</button>
                    <button type="button" onClick={() => setActiveWebsite(site)} className="rounded-md border px-3 py-1 text-xs">Preview</button>
                    <button type="button" onClick={() => void onDelete(site.id)} className="rounded-md border px-3 py-1 text-xs">Delete</button>
                    <button type="button" onClick={() => void onPublish(site.id)} className="rounded-md bg-emerald-600 px-3 py-1 text-xs text-white">Publish</button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Website Builder</h2>
              {activeWebsite ? (
                <div className="mt-3 grid gap-3">
                  <input value={draftContent.businessName} onChange={(e) => setDraftContent((p) => ({ ...p, businessName: e.target.value }))} placeholder="Business name" className="rounded-md border p-2 text-sm" />
                  <input value={draftContent.tagline} onChange={(e) => setDraftContent((p) => ({ ...p, tagline: e.target.value }))} placeholder="Tagline" className="rounded-md border p-2 text-sm" />
                  <textarea value={draftContent.about} onChange={(e) => setDraftContent((p) => ({ ...p, about: e.target.value }))} placeholder="About" className="rounded-md border p-2 text-sm" />
                  <input value={draftContent.contactEmail} onChange={(e) => setDraftContent((p) => ({ ...p, contactEmail: e.target.value }))} placeholder="Contact email" className="rounded-md border p-2 text-sm" />
                  <input value={draftContent.whatsapp} onChange={(e) => setDraftContent((p) => ({ ...p, whatsapp: e.target.value }))} placeholder="WhatsApp" className="rounded-md border p-2 text-sm" />
                  <button type="button" onClick={() => void onSaveEdit()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save</button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Click Edit on a website to load builder with saved config.</p>
              )}
            </section>

            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">Live Preview</h2>
              {previewConfig ? (
                <WebsiteLivePreview designConfig={previewConfig} content={previewContent} />
              ) : (
                <p className="text-sm text-slate-500">No preview available yet.</p>
              )}
              {previewWebsite && <p className="mt-2 text-xs text-slate-500">Latest: {previewWebsite.content.businessName || 'Untitled Website'}</p>}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
