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
    <section className="glass-card animate-fade-up w-full max-w-md p-6 md:p-7">
      <h1 className="text-4xl font-black leading-tight text-white md:text-5xl">Launch with TezWeb</h1>
      <p className="mt-3 text-sm text-slate-200/90">Phone OTP auth, premium templates, and instant website publishing.</p>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-black/20 p-1">
        <button
          type="button"
          onClick={() => onModeChange('login')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            mode === 'login' ? 'bg-white text-slate-900 shadow' : 'text-slate-200 hover:bg-white/10'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => onModeChange('signup')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            mode === 'signup' ? 'bg-white text-slate-900 shadow' : 'text-slate-200 hover:bg-white/10'
          }`}
        >
          Signup
        </button>
      </div>

      {message && (
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-200'
              : 'bg-rose-500/20 text-rose-200'
          }`}
        >
          {message.text}
        </p>
      )}

      {!isOtpStep ? (
        <form className="mt-5 space-y-4" onSubmit={onSubmitPhone}>
          {mode === 'signup' && (
            <label className="block text-sm font-medium text-slate-100">
              Full Name
              <input
                value={state.fullName}
                onChange={(event) => onChange({ fullName: event.target.value })}
                placeholder="John Doe"
                className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-slate-300 outline-none focus:border-cyan-300"
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

          <label className="block text-sm font-medium text-slate-100">
            Phone Number
            <input
              value={state.phoneNumber}
              onChange={(event) => onChange({ phoneNumber: event.target.value })}
              type="tel"
              placeholder="9876543210"
              className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-slate-300 outline-none focus:border-cyan-300"
              required
            />
          </label>

          <div id="firebase-recaptcha" />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : mode === 'login' ? 'Login with OTP' : 'Signup with OTP'}
          </button>
        </form>
      ) : (
        <form className="mt-5 space-y-4" onSubmit={onSubmitOtp}>
          <label className="block text-sm font-medium text-slate-100">
            Enter OTP
            <input
              value={state.verificationCode}
              onChange={(event) => onChange({ verificationCode: event.target.value.replace(/\D/g, '').slice(0, 6) })}
              inputMode="numeric"
              placeholder="123456"
              className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-center text-lg tracking-[0.4em] text-white placeholder:text-slate-300 outline-none focus:border-cyan-300"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
