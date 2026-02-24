import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseEnv } from './env';

const app = initializeApp(firebaseEnv);

export const firebaseAuth = getAuth(app);
export const firestoreDb = getFirestore(app);

export const firebaseStorage = getStorage(app);
