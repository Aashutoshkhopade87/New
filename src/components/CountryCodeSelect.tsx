type CountryCodeSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

const countryCodes = [
  { code: '+1', label: 'US/CA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+91', label: 'IN (+91)' },
  { code: '+61', label: 'AU (+61)' },
  { code: '+81', label: 'JP (+81)' },
  { code: '+971', label: 'UAE (+971)' },
];

export function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      Country Code
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500"
      >
        {countryCodes.map((entry) => (
          <option key={entry.code} value={entry.code}>
            {entry.label}
          </option>
        ))}
      </select>
    </label>
  );
}
