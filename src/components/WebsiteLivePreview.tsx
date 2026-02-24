import type { WebsiteContent } from '../types/website';
import type { DesignConfig } from '../types/design';

type WebsiteLivePreviewProps = {
  designConfig: DesignConfig;
  content: WebsiteContent;
};

export function WebsiteLivePreview({ designConfig, content }: WebsiteLivePreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200" style={{ backgroundColor: designConfig.palette.background }}>
      <div className="p-5" style={{ color: designConfig.palette.text }}>
        <section className="rounded-lg p-4" style={{ backgroundColor: designConfig.palette.primary, color: '#fff' }}>
          <p className="text-xs uppercase">AI Hero • {designConfig.heroStyle}</p>
          <h3 className="mt-2 text-xl font-bold">{content.businessName || 'Business Name'}</h3>
          <p className="text-sm">{content.tagline || 'Your tagline appears here'}</p>
        </section>
        <div className="mt-4 space-y-2 text-sm">
          <p><strong>Social icons:</strong> Instagram • Facebook • YouTube</p>
          <p><strong>Products:</strong> {content.products.join(', ') || 'Product 1, Product 2'}</p>
          <p><strong>Gallery:</strong> Image grid section</p>
          <p><strong>About:</strong> {content.about || 'Tell customers about your business.'}</p>
          <p><strong>Location + Google Map:</strong> Embedded map section</p>
          <p><strong>WhatsApp:</strong> {content.whatsapp || '+91 00000 00000'}</p>
          <p><strong>Contact:</strong> {content.contactEmail || 'hello@example.com'}</p>
        </div>
      </div>
    </div>
  );
}
