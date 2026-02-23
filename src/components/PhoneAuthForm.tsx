import type { FormEvent } from 'react';
import type { AuthMessage, AuthStep, PhoneAuthState } from '../types/auth';
import { CountryCodeSelect } from './CountryCodeSelect';

type PhoneAuthFormProps = {
  state: PhoneAuthState;
  step: AuthStep;
  message: AuthMessage | null;
  loading: boolean;
  onChange: (patch: Partial<PhoneAuthState>) => void;
  onSubmitPhone: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSubmitCode: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function PhoneAuthForm({
  state,
  step,
  message,
  loading,
  onChange,
  onSubmitPhone,
  onSubmitCode,
}: PhoneAuthFormProps) {
  const isVerifyStep = step === 'verify-code';

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">TezWeb Firebase Auth</h1>
      <p className="mt-2 text-sm text-slate-600">Phone number sign-in with Firestore profile sync.</p>

      {message && (
        <p
          className={`mt-4 rounded-md px-3 py-2 text-sm ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </p>
      )}

      {!isVerifyStep ? (
        <form className="mt-5 space-y-4" onSubmit={onSubmitPhone}>
          <CountryCodeSelect value={state.countryCode} onChange={(countryCode) => onChange({ countryCode })} />

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Phone Number
            <input
              value={state.phoneNumber}
              onChange={(event) => onChange({ phoneNumber: event.target.value })}
              type="tel"
              placeholder="9876543210"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
              required
            />
          </label>

          <div id="firebase-recaptcha" className="pt-2" />

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form className="mt-5 space-y-4" onSubmit={onSubmitCode}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Verification Code
            <input
              value={state.verificationCode}
              onChange={(event) => onChange({ verificationCode: event.target.value })}
              type="text"
              placeholder="123456"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
              required
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
      )}
    </div>
  );
}
