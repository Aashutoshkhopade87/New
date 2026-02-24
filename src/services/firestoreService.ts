import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { firestoreDb } from '../lib/firebase';
import type { UserProfile } from '../types/template';
import type { DesignConfig } from '../types/design';

type UpsertProfileInput = {
  user: User;
  fullName?: string;
};

export async function upsertUserProfile({ user, fullName }: UpsertProfileInput) {
  const userDocRef = doc(firestoreDb, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    const now = Date.now();
    const trialEndsAt = Timestamp.fromDate(new Date(now + 7 * 24 * 60 * 60 * 1000));

    await setDoc(userDocRef, {
      uid: user.uid,
      phone: user.phoneNumber,
      fullName: fullName?.trim() || null,
      createdAt: serverTimestamp(),
      trialEndsAt,
      plan: 'trial',
      status: 'active',
      maxWebsites: 2,
    });

    return;
  }

  await setDoc(
    userDocRef,
    {
      phone: user.phoneNumber,
      fullName: fullName?.trim() || userDoc.data().fullName || null,
      status: 'active',
    },
    { merge: true },
  );
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDocRef = doc(firestoreDb, 'users', uid);
  const snapshot = await getDoc(userDocRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}

export async function saveTemplateSelection(uid: string, templateId: string): Promise<boolean> {
  const userDocRef = doc(firestoreDb, 'users', uid);

  return runTransaction(firestoreDb, async (transaction) => {
    const currentSnapshot = await transaction.get(userDocRef);
    const currentData = currentSnapshot.data() as DocumentData | undefined;

    if (!currentSnapshot.exists()) {
      throw new Error('User profile not found. Complete authentication first.');
    }

    if (currentData?.templateId) {
      return false;
    }

    transaction.update(userDocRef, {
      templateId,
      templateSelectedAt: serverTimestamp(),
    });

    return true;
  });
}


export async function saveDesignConfig(uid: string, designConfig: DesignConfig) {
  const userDocRef = doc(firestoreDb, 'users', uid);
  const snapshot = await getDoc(userDocRef);

  if (!snapshot.exists()) {
    throw new Error('User profile not found. Complete authentication first.');
  }

  await setDoc(
    userDocRef,
    {
      designConfig,
      designUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
