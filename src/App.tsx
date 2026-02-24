import { useMemo, useState } from 'react';
import { AuthPage } from './pages/AuthPage';
import { CreateWebsiteFlowPage } from './pages/CreateWebsiteFlowPage';
import { LandingPage } from './pages/LandingPage';
import { PublishedWebsitePage } from './pages/PublishedWebsitePage';

type AppView = 'landing' | 'create' | 'auth';

type PublishedRoute =
  | { mode: 'subdomain'; value: string }
  | { mode: 'slug'; value: string }
  | null;

function resolvePublishedRoute(): PublishedRoute {
  const cleanHost = window.location.hostname.split(':')[0].toLowerCase();

  if (cleanHost.endsWith('.tezweb.com')) {
    const subdomain = cleanHost.replace('.tezweb.com', '');
    if (subdomain) return { mode: 'subdomain', value: subdomain };
  }

  const pathMatch = window.location.pathname.match(/^\/site\/([a-z0-9-]+)/i);
  if (pathMatch?.[1]) return { mode: 'slug', value: pathMatch[1] };

  const query = new URLSearchParams(window.location.search).get('published');
  if (query) return { mode: 'subdomain', value: query };

  return null;
}

function App() {
  const [view, setView] = useState<AppView>('landing');
  const publishedRoute = useMemo(resolvePublishedRoute, []);

  if (publishedRoute) {
    return (
      <PublishedWebsitePage
        subdomain={publishedRoute.mode === 'subdomain' ? publishedRoute.value : undefined}
        slug={publishedRoute.mode === 'slug' ? publishedRoute.value : undefined}
      />
    );
  }

  if (view === 'auth') return <AuthPage />;

  if (view === 'create') {
    return (
      <CreateWebsiteFlowPage
        onBack={() => setView('landing')}
        onRequireAuthForAction={() => setView('auth')}
      />
    );
  }

  return (
    <LandingPage
      onCreateWebsite={() => setView('create')}
      onBrowseTemplates={() => setView('create')}
      onOpenDashboard={() => setView('auth')}
    />
  );
}

export default App;
