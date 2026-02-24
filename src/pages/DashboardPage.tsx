import { applySeo } from '../lib/seo';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  uploadWebsiteImage,
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
  socialLinks: { instagram: '', facebook: '', youtube: '' },
  gallery: [],
};

function parseDateValue(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) return (value as { toDate: () => Date }).toDate();
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return null;
}

function getPublishAccess(profile: UserProfile | null) {
  if (!profile) return { canPublish: false, reason: 'Profile not available.' };

  const paidUntil = parseDateValue(profile.paidUntil);
  if (profile.subscriptionStatus === 'active' && paidUntil && paidUntil.getTime() > Date.now()) {
    return { canPublish: true, reason: 'Paid plan active.' };
  }

  const trialEndsAt = parseDateValue(profile.trialEndsAt);
  if (trialEndsAt && trialEndsAt.getTime() > Date.now()) {
    const daysLeft = Math.max(1, Math.ceil((trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
    return { canPublish: true, reason: `${daysLeft} day(s) left in free trial.` };
  }

  return { canPublish: false, reason: 'Trial expired. Subscribe for ₹199/month to continue publishing.' };
}

export function DashboardPage({ user, profile }: DashboardPageProps) {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [activeWebsite, setActiveWebsite] = useState<Website | null>(null);
  const [draftContent, setDraftContent] = useState<WebsiteContent>(initialContent);
  const [message, setMessage] = useState('');
  const [profileState, setProfileState] = useState<UserProfile | null>(profile);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const autosaveTimer = useRef<number | null>(null);

  const designConfig = profileState?.designConfig;
  const publishAccess = useMemo(() => getPublishAccess(profileState), [profileState]);
  const trialEndsAt = parseDateValue(profileState?.trialEndsAt);
  const trialDaysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000)) : 0;

  useEffect(() => {
    applySeo({ title: 'TezWeb Dashboard', description: 'Manage websites, analytics, publishing, and subscription.', url: 'https://tezweb.com/dashboard', robots: 'noindex,nofollow' });
  }, []);

  useEffect(() => {
    async function init() {
      const nextProfile = await enforceTrialAndPublishingAccess(user.uid);
      setProfileState(nextProfile);
      setShowUpgradePopup(!getPublishAccess(nextProfile).canPublish);
      setWebsites(await listWebsites(user.uid));
    }

    void init();
  }, [user.uid]);

  useEffect(() => {
    if (!activeWebsite) return;

    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(() => {
      void updateWebsite(user.uid, activeWebsite.id, { content: draftContent }).then((updated) => {
        setWebsites((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setActiveWebsite(updated);
      });
    }, 1200);

    return () => {
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    };
  }, [draftContent, activeWebsite, user.uid]);

  async function handleSubscribe() {
    try {
      await openRazorpayCheckout({ amountInPaise: 19900, name: 'TezWeb', description: 'TezWeb Pro Subscription - ₹199/month', prefill: { contact: user.phoneNumber ?? undefined } });
      setProfileState(await activateSubscription(user.uid));
      setShowUpgradePopup(false);
      setMessage('Subscription activated for 30 days.');
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  async function onCreate() {
    if (!designConfig || !profileState?.templateId) {
      setMessage('Please finalize template + design config first.');
      return;
    }

    const created = await createWebsite(user.uid, { templateId: profileState.templateId, designConfig, content: initialContent });
    setWebsites((prev) => [created, ...prev]);
    setActiveWebsite(created);
    setDraftContent(created.content);
  }

  async function setActive(site: Website, editing = false) {
    const updated = await trackPageView(user.uid, site.id);
    setWebsites((prev) => prev.map((item) => (item.id === site.id ? updated : item)));
    setActiveWebsite(updated);
    if (editing) setDraftContent(updated.content);
  }

  async function onTogglePublish(site: Website) {
    if (site.status !== 'published' && !publishAccess.canPublish) {
      setShowUpgradePopup(true);
      return;
    }

    const updated = site.status === 'published'
      ? await unpublishWebsite(user.uid, site.id)
      : await publishWebsite(user.uid, site.id, site.content.businessName || 'shop');

    setWebsites((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (activeWebsite?.id === updated.id) setActiveWebsite(updated);
  }

  const previewConfig: DesignConfig | undefined = activeWebsite?.designConfig || designConfig;
  const previewContent = activeWebsite ? draftContent : initialContent;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="glass-card p-5">
          <h1 className="gradient-text text-4xl font-black md:text-5xl">TezWeb Dashboard</h1>
          <p className="mt-2 text-sm text-slate-200">Trial days left: {trialDaysLeft} • Subscription: {profileState?.subscriptionStatus ?? 'inactive'}</p>
          <button onClick={() => void onCreate()} type="button" className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white">Create Website</button>
          {message && <p className="mt-2 text-sm text-slate-200">{message}</p>}
        </header>

        {showUpgradePopup && (
          <section className="glass-card border border-amber-300/50 bg-amber-500/10 p-4 text-amber-100">
            <p className="text-sm">Trial expired. Upgrade to Pro to publish again. Free: 1 website, Pro: 2 websites + no branding + analytics.</p>
          </section>
        )}

        <section className="glass-card p-4">
          <h2 className="text-lg font-semibold text-white">Subscription Panel</h2>
          <p className="mt-1 text-sm text-slate-300">Free trial 7 days. Paid plan ₹199/month.</p>
          <p className="mt-1 text-sm text-slate-300">{publishAccess.reason}</p>
          <button type="button" onClick={() => void handleSubscribe()} className="mt-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white">Subscribe ₹199/month</button>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="glass-card p-4">
            <h2 className="mb-3 text-lg font-semibold text-white">Websites</h2>
            <div className="space-y-3">
              {websites.map((site) => (
                <article key={site.id} className="premium-card p-3">
                  <div className="flex items-center gap-3">
                    <img src={site.thumbnailUrl} alt="thumbnail" loading="lazy" className="h-16 w-24 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{site.content.businessName || 'Untitled Website'}</p>
                      <p className="text-xs text-slate-300">Status: {site.status}</p>
                      {site.publishedPath && <p className="text-xs text-cyan-200">tezweb.com{site.publishedPath}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => void setActive(site, true)} className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white">Edit</button>
                    <button type="button" onClick={() => void setActive(site)} className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white">Preview</button>
                    <button type="button" onClick={() => void deleteWebsite(user.uid, site.id).then(() => setWebsites((prev) => prev.filter((item) => item.id !== site.id)))} className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white">Delete</button>
                    <button type="button" disabled={site.status !== 'published' && !publishAccess.canPublish} onClick={() => void onTogglePublish(site)} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white disabled:bg-slate-500">{site.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                  </div>
                </article>
              ))}
              {websites.length === 0 && <p className="text-sm text-slate-300">No websites yet.</p>}
            </div>
          </div>

          <div className="space-y-4">
            <section className="glass-card p-4">
              <h2 className="text-lg font-semibold text-white">Editor (Auto-save)</h2>
              {activeWebsite ? (
                <div className="mt-3 grid gap-3">
                  <input value={draftContent.businessName} onChange={(event) => setDraftContent((prev) => ({ ...prev, businessName: event.target.value }))} placeholder="Business name" className="rounded-xl border border-white/20 bg-white/10 p-2 text-sm text-white" />
                  <input value={draftContent.tagline} onChange={(event) => setDraftContent((prev) => ({ ...prev, tagline: event.target.value }))} placeholder="Tagline" className="rounded-xl border border-white/20 bg-white/10 p-2 text-sm text-white" />
                  <textarea value={draftContent.about} onChange={(event) => setDraftContent((prev) => ({ ...prev, about: event.target.value }))} placeholder="About" className="rounded-xl border border-white/20 bg-white/10 p-2 text-sm text-white" />
                  <input value={draftContent.whatsapp} onChange={(event) => setDraftContent((prev) => ({ ...prev, whatsapp: event.target.value }))} placeholder="WhatsApp" className="rounded-xl border border-white/20 bg-white/10 p-2 text-sm text-white" />
                  <input value={draftContent.products.join(', ')} onChange={(event) => setDraftContent((prev) => ({ ...prev, products: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) }))} placeholder="Products (comma separated)" className="rounded-xl border border-white/20 bg-white/10 p-2 text-sm text-white" />
                  <input value={draftContent.socialLinks?.instagram ?? ''} onChange={(event) => setDraftContent((prev) => ({ ...prev, socialLinks: { ...(prev.socialLinks ?? {}), instagram: event.target.value } }))} placeholder="Instagram link" className="rounded-xl border border-white/20 bg-white/10 p-2 text-sm text-white" />
                  <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file || !activeWebsite) return; void uploadWebsiteImage(user.uid, activeWebsite.id, file).then((url) => setDraftContent((prev) => ({ ...prev, heroImage: url, gallery: [...(prev.gallery ?? []), url] }))); }} className="rounded-xl border border-white/20 bg-white/10 p-2 text-sm text-white" />
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-300">Select website to edit.</p>
              )}
            </section>

            <section className="glass-card p-4">
              <h2 className="mb-3 text-lg font-semibold text-white">Live Preview</h2>
              {previewConfig ? (
                <WebsiteLivePreview
                  designConfig={previewConfig}
                  content={previewContent}
                  onWhatsAppClick={() => activeWebsite && void trackWhatsAppClick(user.uid, activeWebsite.id)}
                  onProductClick={() => activeWebsite && void trackProductClick(user.uid, activeWebsite.id)}
                />
              ) : <p className="text-sm text-slate-300">No preview.</p>}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
