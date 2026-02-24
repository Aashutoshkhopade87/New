import type { FormEvent } from 'react';
import type { AuthMessage, AuthMode, AuthStep, PhoneAuthState } from '../types/auth';
import { CountryCodeSelect } from './CountryCodeSelect';

type PhoneAuthFormProps = {
  state: PhoneAuthState;
  mode: AuthMode;
  step: AuthStep;
  loading: boolean;
  message: AuthMessage | null;
  onChange: (patch: Partial<PhoneAuthState>) => void;
  onModeChange: (mode: AuthMode) => void;
  onSubmitPhone: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSubmitOtp: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onBack: () => void;
};

export function PhoneAuthForm({
  state,
  mode,
  step,
  loading,
  message,
  onChange,
  onModeChange,
  onSubmitPhone,
  onSubmitOtp,
  onBack,
}: PhoneAuthFormProps) {
  const isOtpStep = step === 'verify-otp';

  return (
    <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">TezWeb Starter</h1>
      <p className="mt-2 text-sm text-slate-600">Firebase Phone OTP with Firestore profile onboarding.</p>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => onModeChange('login')}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === 'login' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => onModeChange('signup')}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === 'signup' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
        >
          Signup
        </button>
      </div>

      {message && (
        <p
          className={`mt-4 rounded-md px-3 py-2 text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </p>
      )}

      {!isOtpStep ? (
        <form className="mt-5 space-y-4" onSubmit={onSubmitPhone}>
          {mode === 'signup' && (
            <label className="block text-sm font-medium text-slate-700">
              Full Name
              <input
                value={state.fullName}
                onChange={(event) => onChange({ fullName: event.target.value })}
                placeholder="John Doe"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                required
              />
            </label>
          )}

          <CountryCodeSelect
            selectedCode={state.countryCode}
            searchValue={state.countrySearch}
            onSearchChange={(countrySearch) => onChange({ countrySearch })}
            onSelect={(entry) => onChange({ countryCode: entry.code })}
          />

          <label className="block text-sm font-medium text-slate-700">
            Phone Number
            <input
              value={state.phoneNumber}
              onChange={(event) => onChange({ phoneNumber: event.target.value })}
              type="tel"
              placeholder="9876543210"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              required
            />
          </label>

          <div id="firebase-recaptcha" />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Sending OTP...' : mode === 'login' ? 'Login with OTP' : 'Signup with OTP'}
          </button>
        </form>
      ) : (
        <form className="mt-5 space-y-4" onSubmit={onSubmitOtp}>
          <label className="block text-sm font-medium text-slate-700">
            Enter OTP
            <input
              value={state.verificationCode}
              onChange={(event) => onChange({ verificationCode: event.target.value.replace(/\D/g, '').slice(0, 6) })}
              inputMode="numeric"
              placeholder="123456"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg tracking-[0.4em] outline-none focus:border-blue-500"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
