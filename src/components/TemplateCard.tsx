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
      className={`overflow-hidden rounded-xl border text-left transition ${
        selected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300'
      } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      <img src={template.imageUrl} alt={template.name} className="h-44 w-full object-cover" />
      <div className="p-3">
        <p className="text-sm font-semibold text-slate-900">{template.name}</p>
      </div>
    </button>
  );
}
