type LandingPageProps = {
  onCreateWebsite: () => void;
  onBrowseTemplates: () => void;
  onOpenDashboard: () => void;
};

export function LandingPage({ onCreateWebsite, onBrowseTemplates, onOpenDashboard }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <section className="glass-card p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Built for Indian Small Businesses</p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Create Your Business Website in Just 2 Minutes</h1>
          <p className="mt-3 text-lg text-slate-200">No coding needed. WhatsApp powered websites.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button onClick={onCreateWebsite} className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-semibold">Create Website</button>
            <button onClick={onBrowseTemplates} className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold">Browse Templates</button>
          </div>

          <button onClick={onOpenDashboard} className="mt-4 text-sm text-cyan-200 underline">Open Dashboard (Login required)</button>
        </section>
      </div>
    </main>
  );
}
