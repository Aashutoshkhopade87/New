import { applySeo } from '../lib/seo';
import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import type { DesignConfig } from '../types/design';
import type { UserProfile } from '../types/template';
import type { Website, WebsiteContent } from '../types/website';
import { openRazorpayCheckout } from '../lib/razorpay';
import {
  activateSubscription,
  createWebsite,
  deleteWebsite,
  enforceTrialAndPublishingAccess,
  listWebsites,
  publishWebsite,
  trackPageView,
  trackProductClick,
  trackWhatsAppClick,
  unpublishWebsite,
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

function parseDateValue(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }
  return null;
}

function getPublishAccess(profile: UserProfile | null) {
  if (!profile) {
    return { canPublish: false, reason: 'Profile not available.' };
  }

  const paidUntil = parseDateValue(profile.paidUntil);
  if (profile.subscriptionStatus === 'active' && paidUntil && paidUntil.getTime() > Date.now()) {
    return { canPublish: true, reason: '' };
  }

  const trialEndsAt = parseDateValue(profile.trialEndsAt);
  if (trialEndsAt && trialEndsAt.getTime() > Date.now()) {
    const daysLeft = Math.max(1, Math.ceil((trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
    return { canPublish: true, reason: `${daysLeft} day(s) left in free trial.` };
  }

  return {
    canPublish: false,
    reason: 'Trial expired. Subscribe for ₹199/month to continue publishing.',
  };
}

function ChartRow({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max === 0 ? 0 : Math.max(8, Math.round((value / max) * 100));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded bg-white/10">
        <div className="h-2 rounded bg-gradient-to-r from-cyan-400 to-violet-400" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function DashboardPage({ user, profile }: DashboardPageProps) {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [activeWebsite, setActiveWebsite] = useState<Website | null>(null);
  const [draftContent, setDraftContent] = useState<WebsiteContent>(initialContent);
  const [message, setMessage] = useState('');
  const [profileState, setProfileState] = useState<UserProfile | null>(profile);

  const designConfig = profileState?.designConfig;
  const publishAccess = useMemo(() => getPublishAccess(profileState), [profileState]);

  useEffect(() => {
    applySeo({
      title: 'TezWeb Dashboard',
      description: 'Manage websites, analytics, publishing, and subscription.',
      url: 'https://tezweb.com/dashboard',
      robots: 'noindex,nofollow',
    });
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      const nextProfile = await enforceTrialAndPublishingAccess(user.uid);
      setProfileState(nextProfile);
      const items = await listWebsites(user.uid);
      setWebsites(items);
    }

    void loadDashboardData();
  }, [user.uid]);

  async function handleSubscribe() {
    try {
      await openRazorpayCheckout({
        amountInPaise: 19900,
        name: 'TezWeb',
        description: 'TezWeb Pro Subscription - ₹199/month',
        prefill: {
          contact: user.phoneNumber ?? undefined,
        },
      });
      const updatedProfile = await activateSubscription(user.uid);
      setProfileState(updatedProfile);
      setMessage('Subscription activated for 30 days.');
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  async function setActiveWithTracking(website: Website, editing = false) {
    const updated = await trackPageView(user.uid, website.id);
    setWebsites((prev) => prev.map((item) => (item.id === website.id ? updated : item)));
    setActiveWebsite(updated);
    if (editing) {
      setDraftContent(updated.content);
      setMessage('Editing website with live preview.');
    }
  }

  function onEdit(website: Website) {
    void setActiveWithTracking(website, true);
  }

  async function onCreate() {
    if (!designConfig || !profileState?.templateId) {
      setMessage('Generate and save a design config first.');
      return;
    }

    const created = await createWebsite(user.uid, {
      designConfig,
      templateId: profileState.templateId,
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

  async function onTogglePublish(site: Website) {
    if (site.status !== 'published' && !publishAccess.canPublish) {
      setMessage(publishAccess.reason);
      return;
    }

    const updated =
      site.status === 'published'
        ? await unpublishWebsite(user.uid, site.id)
        : await publishWebsite(user.uid, site.id, site.content.businessName || 'shop');

    setWebsites((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (activeWebsite?.id === updated.id) {
      setActiveWebsite(updated);
    }
  }

  async function onWhatsAppClick() {
    if (!activeWebsite) return;
    const updated = await trackWhatsAppClick(user.uid, activeWebsite.id);
    setWebsites((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setActiveWebsite(updated);
  }

  async function onProductClick() {
    if (!activeWebsite) return;
    const updated = await trackProductClick(user.uid, activeWebsite.id);
    setWebsites((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setActiveWebsite(updated);
  }

  const previewConfig: DesignConfig | undefined = activeWebsite?.designConfig || designConfig;
  const previewContent = activeWebsite ? draftContent : initialContent;

  const chartMax = useMemo(() => {
    return websites.reduce((max, site) => {
      return Math.max(max, site.analytics.views, site.analytics.whatsappClicks, site.analytics.productClicks);
    }, 0);
  }, [websites]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="glass-card animate-fade-up p-5">
          <h1 className="gradient-text text-4xl font-black md:text-5xl">TezWeb Dashboard</h1>
          <p className="mt-2 text-sm text-slate-200">Manage websites, publishing, and analytics with a premium workflow.</p>
          <button onClick={() => void onCreate()} type="button" className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white">Create Website</button>
          {message && <p className="mt-2 text-sm text-slate-200">{message}</p>}
        </header>

        <section className="glass-card p-5">
          <h2 className="text-lg font-semibold text-white">Subscription</h2>
          <p className="mt-1 text-sm text-slate-300">Plan: ₹199/month after 7-day trial.</p>
          <p className="mt-1 text-sm text-slate-300">{publishAccess.canPublish ? publishAccess.reason || 'Publishing enabled.' : publishAccess.reason}</p>
          <button type="button" onClick={() => void handleSubscribe()} className="mt-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white">Subscribe ₹199/month</button>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="glass-card p-4">
            <h2 className="mb-3 text-lg font-semibold text-white">Websites</h2>
            <div className="space-y-3">
              {websites.length === 0 && <p className="text-sm text-slate-300">No websites yet. Create your first website.</p>}
              {websites.map((site) => (
                <article key={site.id} className="premium-card p-3">
                  <div className="flex items-center gap-3">
                    <img src={site.thumbnailUrl} alt="thumbnail" className="h-16 w-24 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{site.content.businessName || 'Untitled Website'}</p>
                      <p className="text-xs text-slate-300">Status: {site.status}</p>
                      {site.subdomain && <p className="text-xs text-cyan-200">{site.subdomain}.tezweb.com</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => onEdit(site)} className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white hover:bg-white/10">Edit</button>
                    <button type="button" onClick={() => void setActiveWithTracking(site)} className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white hover:bg-white/10">Preview</button>
                    <button type="button" onClick={() => void onDelete(site.id)} className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white hover:bg-white/10">Delete</button>
                    <button type="button" disabled={site.status !== 'published' && !publishAccess.canPublish} onClick={() => void onTogglePublish(site)} className={`rounded-lg px-3 py-1 text-xs font-semibold text-white ${site.status === 'published' ? 'bg-amber-600' : 'bg-emerald-600'} disabled:cursor-not-allowed disabled:bg-slate-500`}>
                      {site.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <section className="glass-card p-4">
              <h2 className="text-lg font-semibold text-white">Website Builder</h2>
              {activeWebsite ? (
                <div className="mt-3 grid gap-3">
                  <input value={draftContent.businessName} onChange={(event) => setDraftContent((prev) => ({ ...prev, businessName: event.target.value }))} placeholder="Business name" className="rounded-xl border border-white/20 bg-white/10 p-2 text-sm text-white placeholder:text-slate-300" />
                  <input value={draftContent.tagline} onChange={(event) => setDraftContent((prev) => ({ ...prev, tagline: event.target.value }))} placeholder="Tagline" className="rounded-xl border border-white/20 bg-white/10 p-2 text-sm text-white placeholder:text-slate-300" />
                  <textarea value={draftContent.about} onChange={(event) => setDraftContent((prev) => ({ ...prev, about: event.target.value }))} placeholder="About" className="rounded-xl border border-white/20 bg-white/10 p-2 text-sm text-white placeholder:text-slate-300" />
                  <input value={draftContent.contactEmail} onChange={(event) => setDraftContent((prev) => ({ ...prev, contactEmail: event.target.value }))} placeholder="Contact email" className="rounded-xl border border-white/20 bg-white/10 p-2 text-sm text-white placeholder:text-slate-300" />
                  <input value={draftContent.whatsapp} onChange={(event) => setDraftContent((prev) => ({ ...prev, whatsapp: event.target.value }))} placeholder="WhatsApp" className="rounded-xl border border-white/20 bg-white/10 p-2 text-sm text-white placeholder:text-slate-300" />
                  <button type="button" onClick={() => void onSaveEdit()} className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white">Save</button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-300">Click Edit on a website to load builder with saved config.</p>
              )}
            </section>

            <section className="glass-card p-4">
              <h2 className="mb-3 text-lg font-semibold text-white">Live Preview</h2>
              {previewConfig ? (
                <WebsiteLivePreview designConfig={previewConfig} content={previewContent} onWhatsAppClick={() => void onWhatsAppClick()} onProductClick={() => void onProductClick()} />
              ) : (
                <p className="text-sm text-slate-300">No preview available yet.</p>
              )}
            </section>
          </div>
        </section>

        <section className="glass-card p-4">
          <h2 className="text-lg font-semibold text-white">Analytics</h2>
          <p className="mt-1 text-sm text-slate-300">Tracks page views, WhatsApp clicks, and product clicks per website.</p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {websites.map((site) => (
              <article key={`analytics-${site.id}`} className="premium-card p-3">
                <p className="mb-2 text-sm font-semibold text-white">{site.content.businessName || 'Untitled Website'}</p>
                <div className="space-y-2">
                  <ChartRow label="Page views" value={site.analytics.views} max={chartMax} />
                  <ChartRow label="WhatsApp clicks" value={site.analytics.whatsappClicks} max={chartMax} />
                  <ChartRow label="Product clicks" value={site.analytics.productClicks} max={chartMax} />
                </div>
              </article>
            ))}
            {websites.length === 0 && <p className="text-sm text-slate-300">No analytics yet. Create and preview a website first.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
