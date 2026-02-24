import type { WebsiteContent } from '../types/website';
import type { DesignConfig } from '../types/design';

type WebsiteLivePreviewProps = {
  designConfig: DesignConfig;
  content: WebsiteContent;
  onWhatsAppClick?: () => void;
  onProductClick?: () => void;
};

export function WebsiteLivePreview({
  designConfig,
  content,
  onWhatsAppClick,
  onProductClick,
}: WebsiteLivePreviewProps) {
  return (
    <div className="premium-card overflow-hidden">
      <div className="p-5" style={{ color: designConfig.palette.text }}>
        <section
          className="rounded-xl p-5 shadow-xl"
          style={{ background: `linear-gradient(120deg, ${designConfig.palette.primary}, ${designConfig.palette.secondary})`, color: '#fff' }}
        >
          <p className="text-xs uppercase tracking-[0.18em]">AI Hero • {designConfig.heroStyle}</p>
          <h3 className="mt-2 text-3xl font-black leading-tight">{content.businessName || 'Business Name'}</h3>
          <p className="text-sm opacity-95">{content.tagline || 'Your tagline appears here'}</p>
        </section>

        <div className="mt-4 space-y-3 text-sm text-slate-100">
          <p>
            <strong>Social icons:</strong> Instagram • Facebook • YouTube
          </p>

          <div>
            <p>
              <strong>Products:</strong>
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {content.products.map((product) => (
                <button
                  key={product}
                  type="button"
                  onClick={onProductClick}
                  className="rounded-lg border border-white/30 bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
                >
                  {product}
                </button>
              ))}
            </div>
          </div>

          <p>
            <strong>Gallery:</strong> Image grid section
          </p>
          <p>
            <strong>About:</strong> {content.about || 'Tell customers about your business.'}
          </p>
          <p>
            <strong>Location + Google Map:</strong> Embedded map section
          </p>
          <p>
            <strong>WhatsApp:</strong>{' '}
            <button
              type="button"
              onClick={onWhatsAppClick}
              className="font-semibold text-cyan-200 underline"
            >
              {content.whatsapp || '+91 00000 00000'}
            </button>
          </p>
          <p>
            <strong>Contact:</strong> {content.contactEmail || 'hello@example.com'}
          </p>
        </div>
      </div>
    </div>
  );
}
