import { AuthPage } from './pages/AuthPage';
import { PublishedWebsitePage } from './pages/PublishedWebsitePage';

function resolveSubdomainFromHost(hostname: string): string | null {
  const cleanHost = hostname.split(':')[0].toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const querySubdomain = params.get('published');

  if (querySubdomain) {
    return querySubdomain;
  }

  if (!cleanHost.endsWith('.tezweb.com')) {
    return null;
  }

  const subdomain = cleanHost.replace('.tezweb.com', '');
  return subdomain || null;
}

function App() {
  const subdomain = resolveSubdomainFromHost(window.location.hostname);

  if (subdomain) {
    return <PublishedWebsitePage subdomain={subdomain} />;
  }

  return <AuthPage />;
}

export default App;
