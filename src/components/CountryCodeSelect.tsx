import { useMemo, useState } from 'react';
import type { CountryOption } from '../types/auth';

type CountryCodeSelectProps = {
  selectedCode: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelect: (country: CountryOption) => void;
};

const countries: CountryOption[] = [
  { country: 'United States', code: '+1', flag: '🇺🇸' },
  { country: 'Canada', code: '+1', flag: '🇨🇦' },
  { country: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { country: 'India', code: '+91', flag: '🇮🇳' },
  { country: 'Australia', code: '+61', flag: '🇦🇺' },
  { country: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { country: 'Germany', code: '+49', flag: '🇩🇪' },
  { country: 'France', code: '+33', flag: '🇫🇷' },
  { country: 'Singapore', code: '+65', flag: '🇸🇬' },
  { country: 'Japan', code: '+81', flag: '🇯🇵' },
];

export function CountryCodeSelect({
  selectedCode,
  searchValue,
  onSearchChange,
  onSelect,
}: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedCountry = useMemo(
    () => countries.find((entry) => entry.code === selectedCode) ?? countries[0],
    [selectedCode],
  );

  const filteredCountries = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return countries;
    }

    return countries.filter((entry) => {
      return (
        entry.country.toLowerCase().includes(query) ||
        entry.code.includes(query) ||
        entry.flag.includes(query)
      );
    });
  }, [searchValue]);

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-medium text-slate-700">Country Code</label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left"
      >
        <span>
          {selectedCountry.flag} {selectedCountry.country} ({selectedCountry.code})
        </span>
        <span className="text-slate-500">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search country or code"
            className="mb-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <ul className="max-h-48 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <li className="px-2 py-2 text-sm text-slate-500">No countries found.</li>
            ) : (
              filteredCountries.map((entry) => (
                <li key={`${entry.country}-${entry.code}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(entry);
                      onSearchChange('');
                      setOpen(false);
                    }}
                    className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100"
                  >
                    {entry.flag} {entry.country} ({entry.code})
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
