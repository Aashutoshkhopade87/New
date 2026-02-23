import { useEffect, useState, type FormEvent } from 'react';
import type { ConfirmationResult, User } from 'firebase/auth';
import { PhoneAuthForm } from '../components/PhoneAuthForm';
import {
  getOrCreateRecaptcha,
  requestPhoneVerification,
  subscribeToAuthChanges,
  verifySmsCode,
  logout,
} from '../services/authService';
import { upsertUserProfile } from '../services/firestoreService';
import type { AuthMessage, AuthStep, PhoneAuthState } from '../types/auth';

const initialState: PhoneAuthState = {
  countryCode: '+91',
  phoneNumber: '',
  verificationCode: '',
};

export function AuthPage() {
  const [state, setState] = useState<PhoneAuthState>(initialState);
  const [step, setStep] = useState<AuthStep>('request-code');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(setCurrentUser);
    return unsubscribe;
  }, []);

  function updateState(patch: Partial<PhoneAuthState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  async function handlePhoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const phone = `${state.countryCode}${state.phoneNumber.replace(/\D/g, '')}`;
      const recaptcha = getOrCreateRecaptcha('firebase-recaptcha');
      const nextConfirmation = await requestPhoneVerification(phone, recaptcha);

      setConfirmation(nextConfirmation);
      setStep('verify-code');
      setMessage({ type: 'success', text: `OTP sent to ${phone}` });
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmation) {
      setMessage({ type: 'error', text: 'OTP session is missing. Request a new code.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const credential = await verifySmsCode(confirmation, state.verificationCode);
      await upsertUserProfile(credential.user);
      setMessage({ type: 'success', text: 'Logged in and profile saved to Firestore.' });
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    setStep('request-code');
    setConfirmation(null);
    setState(initialState);
    setMessage({ type: 'success', text: 'Logged out.' });
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5">
        <PhoneAuthForm
          state={state}
          step={step}
          message={message}
          loading={loading}
          onChange={updateState}
          onSubmitPhone={handlePhoneSubmit}
          onSubmitCode={handleCodeSubmit}
        />

        {currentUser && (
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Authenticated User</h2>
            <p className="mt-2 text-sm text-slate-700">UID: {currentUser.uid}</p>
            <p className="mt-1 text-sm text-slate-700">Phone: {currentUser.phoneNumber}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
