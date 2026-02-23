import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { firestoreDb } from '../lib/firebase';

export async function upsertUserProfile(user: User) {
  const userDocRef = doc(firestoreDb, 'users', user.uid);
  await setDoc(
    userDocRef,
    {
      uid: user.uid,
      phoneNumber: user.phoneNumber,
      lastLoginAt: serverTimestamp(),
    },
    { merge: true },
  );
}
