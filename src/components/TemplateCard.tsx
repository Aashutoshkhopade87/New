import type { Template } from '../types/template';

type TemplateCardProps = {
  template: Template;
  selected: boolean;
  disabled?: boolean;
  onSelect: (templateId: string) => void;
};

export function TemplateCard({ template, selected, disabled = false, onSelect }: TemplateCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(template.id)}
      className={`premium-card group overflow-hidden text-left transition duration-300 ${
        selected ? 'ring-2 ring-cyan-300' : 'hover:-translate-y-1 hover:ring-1 hover:ring-white/30'
      } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <img src={template.imageUrl} alt={template.name} className="h-44 w-full object-cover transition duration-300 group-hover:scale-105" />
      <div className="p-3">
        <p className="text-sm font-semibold text-white">{template.name}</p>
      </div>
    </button>
  );
}
