import { applySeo } from '../lib/seo';
import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { templates } from '../lib/templates';
import { TemplateCard } from '../components/TemplateCard';
import { getUserProfile, saveTemplateSelection } from '../services/firestoreService';
import { WebsiteGenerationPage } from './WebsiteGenerationPage';

type TemplatePreviewPageProps = {
  user: User;
  onTemplateSaved?: () => Promise<void>;
};

export function TemplatePreviewPage({ user, onTemplateSaved }: TemplatePreviewPageProps) {
  useEffect(() => {
    applySeo({
      title: 'Choose a Template | TezWeb',
      description: 'Pick a modern template before generating your website.',
      url: 'https://tezweb.com/dashboard',
      robots: 'noindex,nofollow',
    });
  }, []);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [savedTemplateId, setSavedTemplateId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    async function loadProfile() {
      const profile = await getUserProfile(user.uid);
      if (profile?.templateId) {
        setSavedTemplateId(profile.templateId);
      }
    }

    void loadProfile();
  }, [user.uid]);

  const effectiveSelectedId = useMemo(() => savedTemplateId || selectedTemplateId, [savedTemplateId, selectedTemplateId]);
  const selectedTemplate = templates.find((entry) => entry.id === effectiveSelectedId);
  const hasSavedTemplate = Boolean(savedTemplateId);

  async function handleUseTemplate() {
    if (!selectedTemplateId || hasSavedTemplate) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const success = await saveTemplateSelection(user.uid, selectedTemplateId);

      if (!success) {
        const latestProfile = await getUserProfile(user.uid);
        const existingTemplateId = latestProfile?.templateId ?? '';
        setSavedTemplateId(existingTemplateId);
        setMessage('Template already selected previously. You cannot change it now.');
      } else {
        setSavedTemplateId(selectedTemplateId);
        setMessage('Template saved successfully.');
        if (onTemplateSaved) {
          await onTemplateSaved();
        }
      }
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 pb-24">
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <h1 className="gradient-text text-4xl font-black md:text-5xl">Choose Your Premium Template</h1>
        <p className="mt-2 text-sm text-slate-300 md:text-base">
          Pick one design before creating your website. Template selection is locked after first save.
        </p>

        {message && <p className="mt-4 rounded-lg bg-white/15 px-3 py-2 text-sm text-slate-100">{message}</p>}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, index) => (
            <div key={template.id} className="animate-fade-up" style={{ animationDelay: `${index * 40}ms` }}>
              <TemplateCard
                template={template}
                selected={template.id === effectiveSelectedId}
                disabled={hasSavedTemplate}
                onSelect={setSelectedTemplateId}
              />
            </div>
          ))}
        </div>
      </section>

      {savedTemplateId && <WebsiteGenerationPage user={user} templateId={savedTemplateId} />}

      <div className="fixed inset-x-0 bottom-0 border-t border-white/15 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-300">Selected Template</p>
            <p className="text-sm font-semibold text-white">{selectedTemplate?.name ?? 'None selected'}</p>
          </div>
          <button
            type="button"
            onClick={handleUseTemplate}
            disabled={loading || hasSavedTemplate || !selectedTemplateId}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {hasSavedTemplate ? 'Template Locked' : loading ? 'Saving...' : 'Use This Design'}
          </button>
        </div>
      </div>
    </main>
  );
}
