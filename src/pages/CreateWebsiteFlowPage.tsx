import { useMemo, useState } from 'react';
import { CountryCodeSelect } from '../components/CountryCodeSelect';
import { WebsiteLivePreview } from '../components/WebsiteLivePreview';
import { generateAiWebsite } from '../lib/aiGenerator';
import { saveLocalDraft } from '../lib/localDrafts';
import { templates } from '../lib/templates';
import type { CreateWebsiteInput, Website } from '../types/website';

type CreateWebsiteFlowPageProps = {
  onBack: () => void;
  onRequireAuthForAction: (action: 'publish' | 'edit' | 'dashboard') => void;
};

const categories = ['Retail Shop', 'Restaurant', 'Salon', 'Clinic', 'Coaching', 'Services', 'Other'];

const initialForm: CreateWebsiteInput = {
  businessName: '',
  businessCategory: 'Retail Shop',
  whatsappNumber: '',
  countryCode: '+91',
  language: 'English',
  additionalInstructions: '',
};

export function CreateWebsiteFlowPage({ onBack, onRequireAuthForAction }: CreateWebsiteFlowPageProps) {
  const [form, setForm] = useState<CreateWebsiteInput>(initialForm);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [generated, setGenerated] = useState<Website | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === selectedTemplateId),
    [selectedTemplateId],
  );

  function handleGenerate() {
    if (!form.businessName || !form.whatsappNumber || !selectedTemplateId) return;
    const website = generateAiWebsite(form, selectedTemplateId);
    saveLocalDraft(website);
    setGenerated(website);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <button onClick={onBack} className="text-sm text-cyan-200 underline">← Back</button>

        <section className="glass-card p-5">
          <h2 className="text-2xl font-black">Create Website</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input value={form.businessName} onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))} placeholder="Business Name" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2" />
            <select value={form.businessCategory} onChange={(e) => setForm((p) => ({ ...p, businessCategory: e.target.value }))} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">
              {categories.map((item) => <option key={item} className="text-black">{item}</option>)}
            </select>
            <div className="md:col-span-2">
              <CountryCodeSelect
                selectedCode={form.countryCode}
                searchValue={countrySearch}
                onSearchChange={setCountrySearch}
                onSelect={(country) => setForm((prev) => ({ ...prev, countryCode: country.code }))}
              />
            </div>
            <input value={form.whatsappNumber} onChange={(e) => setForm((p) => ({ ...p, whatsappNumber: e.target.value.replace(/\D/g, '') }))} placeholder="WhatsApp Number" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 md:col-span-2" />
            <select value={form.language} onChange={(e) => setForm((p) => ({ ...p, language: e.target.value as CreateWebsiteInput['language'] }))} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">
              <option className="text-black">English</option>
              <option className="text-black">Hindi</option>
              <option className="text-black">Marathi</option>
            </select>
            <textarea value={form.additionalInstructions} onChange={(e) => setForm((p) => ({ ...p, additionalInstructions: e.target.value }))} placeholder="Additional Instructions (optional)" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 md:col-span-2" />
          </div>
        </section>

        <section className="glass-card p-5">
          <h3 className="text-xl font-bold">Template Selector</h3>
          <p className="text-sm text-slate-300">Choose once. Live preview before selection. Next button appears after selection.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.2fr]">
            <div className="grid grid-cols-2 gap-2">
              {templates.slice(0, 6).map((template) => (
                <button key={template.id} onClick={() => setSelectedTemplateId(template.id)} className={`rounded-xl p-2 text-left ${selectedTemplateId === template.id ? 'bg-cyan-500/30 ring-2 ring-cyan-300' : 'bg-white/10'}`}>
                  <img src={template.imageUrl} alt={template.name} className="h-20 w-full rounded-lg object-cover" loading="lazy" />
                  <p className="mt-1 text-xs">{template.name}</p>
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-cyan-200">Live Preview</p>
              {selectedTemplate ? (
                <div className="mt-2">
                  <img src={selectedTemplate.imageUrl} alt={selectedTemplate.name} className="h-44 w-full rounded-lg object-cover" loading="lazy" />
                  <p className="mt-2 text-sm font-semibold">{selectedTemplate.name}</p>
                </div>
              ) : <p className="mt-10 text-center text-sm text-slate-300">Select a template first.</p>}
            </div>
          </div>

          {selectedTemplateId && (
            <button onClick={handleGenerate} className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-semibold">Next: Generate AI Website</button>
          )}
        </section>

        {generated && (
          <section className="glass-card p-5">
            <h3 className="text-xl font-bold">AI Generated Preview</h3>
            <p className="text-sm text-slate-300">WhatsApp order buttons use: {generated.content.whatsapp}</p>
            <div className="mt-4">
              <WebsiteLivePreview designConfig={generated.designConfig} content={generated.content} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => onRequireAuthForAction('publish')} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold">Publish (Login required)</button>
              <button onClick={() => onRequireAuthForAction('edit')} className="rounded-xl border border-white/30 px-4 py-2 text-sm">Edit in Dashboard</button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
