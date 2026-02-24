import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { ConfirmationResult, User } from 'firebase/auth';
import { PhoneAuthForm } from '../components/PhoneAuthForm';
import type { AuthMessage, AuthMode, AuthStep, PhoneAuthState } from '../types/auth';
import {
  getOrCreateRecaptcha,
  requestPhoneVerification,
  subscribeToAuthChanges,
  verifySmsCode,
} from '../services/authService';
import { getUserProfile, upsertUserProfile } from '../services/firestoreService';
import type { UserProfile } from '../types/template';
import { TemplatePreviewPage } from './TemplatePreviewPage';
import { DashboardPage } from './DashboardPage';

const initialState: PhoneAuthState = {
  countryCode: '+91',
  phoneNumber: '',
  verificationCode: '',
  fullName: '',
  countrySearch: '',
};

export function AuthPage() {
  const [state, setState] = useState<PhoneAuthState>(initialState);
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<AuthStep>('request-otp');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(setCurrentUser);
    return unsubscribe;
  }, []);

  async function refreshProfile(user: User) {
    const nextProfile = await getUserProfile(user.uid);
    setProfile(nextProfile);
  }

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    void refreshProfile(currentUser);
  }, [currentUser]);

  const formattedPhone = useMemo(() => {
    return `${state.countryCode}${state.phoneNumber.replace(/\D/g, '')}`;
  }, [state.countryCode, state.phoneNumber]);

  function updateState(patch: Partial<PhoneAuthState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode);
    setStep('request-otp');
    setMessage(null);
    setConfirmation(null);
    setState((prev) => ({ ...prev, verificationCode: '' }));
  }

  async function handlePhoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const recaptcha = getOrCreateRecaptcha('firebase-recaptcha');
      const nextConfirmation = await requestPhoneVerification(formattedPhone, recaptcha);
      setConfirmation(nextConfirmation);
      setStep('verify-otp');
      setMessage({ type: 'success', text: `OTP sent to ${formattedPhone}` });
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!confirmation) {
      setMessage({ type: 'error', text: 'Session expired. Please request OTP again.' });
      setStep('request-otp');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const credential = await verifySmsCode(confirmation, state.verificationCode);
      await upsertUserProfile({ user: credential.user, fullName: state.fullName });
      await refreshProfile(credential.user);
      setMessage({
        type: 'success',
        text: mode === 'signup' ? 'Signup complete. Trial started!' : 'Login successful.',
      });
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  if (currentUser && profile?.templateId) {
    return <DashboardPage user={currentUser} profile={profile} />;
  }

  if (currentUser) {
    return <TemplatePreviewPage user={currentUser} onTemplateSaved={() => refreshProfile(currentUser)} />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 px-4 py-8 md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.22),transparent_35%),radial-gradient(circle_at_90%_15%,rgba(168,85,247,0.22),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.12),transparent_35%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-stretch gap-6 md:flex-row md:items-center">
        <PhoneAuthForm
          state={state}
          mode={mode}
          step={step}
          loading={loading}
          message={message}
          onChange={updateState}
          onModeChange={handleModeChange}
          onSubmitPhone={handlePhoneSubmit}
          onSubmitOtp={handleOtpSubmit}
          onBack={() => setStep('request-otp')}
        />

        <section className="premium-card animate-fade-up p-6 md:flex-1 md:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Modern TezWeb UI</p>
          <h2 className="gradient-text mt-3 text-4xl font-black leading-tight md:text-6xl">Bold, fast, premium storefronts.</h2>
          <p className="mt-4 max-w-xl text-sm text-slate-200 md:text-base">
            Build responsive sites with beautiful gradients, glass cards, and smooth interactions. Publish faster and keep full control from one dashboard.
          </p>
        </section>
      </div>
    </main>
  );
}
