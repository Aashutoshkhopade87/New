import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';

let recaptchaVerifier: RecaptchaVerifier | null = null;

export function getOrCreateRecaptcha(containerId: string): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
      size: 'normal',
    });
  }

  return recaptchaVerifier;
}

export async function requestPhoneVerification(
  e164PhoneNumber: string,
  recaptcha: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(firebaseAuth, e164PhoneNumber, recaptcha);
}

export async function verifySmsCode(confirmation: ConfirmationResult, code: string) {
  return confirmation.confirm(code);
}

export async function logout() {
  await signOut(firebaseAuth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, callback);
}
