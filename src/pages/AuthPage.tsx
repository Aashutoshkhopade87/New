import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { ConfirmationResult, User } from 'firebase/auth';
import { PhoneAuthForm } from '../components/PhoneAuthForm';
import type { AuthMessage, AuthMode, AuthStep, PhoneAuthState } from '../types/auth';
import {
  getOrCreateRecaptcha,
  logout,
  requestPhoneVerification,
  subscribeToAuthChanges,
  verifySmsCode,
} from '../services/authService';
import { upsertUserProfile } from '../services/firestoreService';

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

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(setCurrentUser);
    return unsubscribe;
  }, []);

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

  async function handleLogout() {
    await logout();
    setState(initialState);
    setStep('request-otp');
    setConfirmation(null);
    setMessage({ type: 'success', text: 'Logged out.' });
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-stretch gap-5 md:flex-row md:items-start">
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

        <section className="w-full rounded-2xl bg-white p-6 shadow-sm md:max-w-xl">
          <h2 className="text-xl font-semibold text-slate-900">Session</h2>
          {!currentUser ? (
            <p className="mt-2 text-sm text-slate-600">No active user yet. Complete OTP verification to sign in.</p>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                <strong>UID:</strong> {currentUser.uid}
              </p>
              <p>
                <strong>Phone:</strong> {currentUser.phoneNumber}
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
