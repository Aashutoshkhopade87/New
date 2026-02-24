import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { firestoreDb } from '../lib/firebase';

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
