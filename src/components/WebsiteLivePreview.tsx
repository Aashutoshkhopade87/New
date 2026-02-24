import type { WebsiteContent } from '../types/website';
import type { DesignConfig } from '../types/design';

type WebsiteLivePreviewProps = {
  designConfig: DesignConfig;
  content: WebsiteContent;
  onWhatsAppClick?: () => void;
  onProductClick?: () => void;
};

export function WebsiteLivePreview({ designConfig, content, onWhatsAppClick, onProductClick }: WebsiteLivePreviewProps) {
  const whatsapp = content.whatsapp || '+910000000000';
  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}`;

  return (
    <div className="premium-card overflow-hidden">
      <div className="p-5" style={{ color: designConfig.palette.text }}>
        <section className="rounded-xl p-5 shadow-xl" style={{ background: `linear-gradient(120deg, ${designConfig.palette.primary}, ${designConfig.palette.secondary})`, color: '#fff' }}>
          <p className="text-xs uppercase tracking-[0.18em]">AI Hero • {designConfig.heroStyle}</p>
          <h3 className="mt-2 text-3xl font-black leading-tight">{content.businessName || 'Business Name'}</h3>
          <p className="text-sm opacity-95">{content.tagline || 'Your tagline appears here'}</p>
        </section>

        <div className="mt-4 space-y-3 text-sm text-slate-100">
          <p><strong>Social:</strong> {content.socialLinks?.instagram || 'Instagram'} • {content.socialLinks?.facebook || 'Facebook'} • {content.socialLinks?.youtube || 'YouTube'}</p>

          <div>
            <p><strong>Products / Services:</strong></p>
            <div className="mt-1 flex flex-wrap gap-2">
              {content.products.map((product) => (
                <a
                  key={product}
                  href={`${waLink}?text=${encodeURIComponent(`Hi, I want to order: ${product}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onProductClick}
                  className="rounded-lg border border-white/30 bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
                >
                  Order {product}
                </a>
              ))}
            </div>
          </div>

          <p><strong>Gallery:</strong> {(content.gallery?.length ?? 0) > 0 ? `${content.gallery?.length} images` : 'Image grid section'}</p>
          <p><strong>About:</strong> {content.about || 'Tell customers about your business.'}</p>
          <p><strong>Location + Map:</strong> {content.locationLabel || 'Your location'} </p>
          <p>
            <strong>WhatsApp CTA:</strong>{' '}
            <a href={waLink} target="_blank" rel="noreferrer" onClick={onWhatsAppClick} className="font-semibold text-cyan-200 underline">{whatsapp}</a>
          </p>
          <p><strong>Contact:</strong> {content.contactEmail || 'hello@example.com'}</p>
        </div>
      </div>
    </div>
  );
}
