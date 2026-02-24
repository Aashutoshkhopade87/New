import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  type DocumentData,
  updateDoc,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { firestoreDb } from '../lib/firebase';
import type { UserProfile } from '../types/template';
import type { DesignConfig } from '../types/design';
import type { Website, WebsiteContent } from '../types/website';

type UpsertProfileInput = {
  user: User;
  fullName?: string;
};

type CreateWebsiteInput = {
  templateId: string;
  designConfig: DesignConfig;
  content: WebsiteContent;
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

function websitesCollection(uid: string) {
  return collection(firestoreDb, 'users', uid, 'websites');
}

function mapWebsite(id: string, data: DocumentData): Website {
  return {
    id,
    templateId: data.templateId,
    thumbnailUrl: data.thumbnailUrl,
    status: data.status,
    designConfig: data.designConfig,
    content: data.content,
  } as Website;
}

export async function listWebsites(uid: string): Promise<Website[]> {
  const snapshot = await getDocs(query(websitesCollection(uid)));
  return snapshot.docs.map((item) => mapWebsite(item.id, item.data()));
}

export async function createWebsite(uid: string, input: CreateWebsiteInput): Promise<Website> {
  const docRef = await addDoc(websitesCollection(uid), {
    templateId: input.templateId,
    designConfig: input.designConfig,
    content: input.content,
    thumbnailUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=600&q=80',
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(docRef);
  return mapWebsite(snapshot.id, snapshot.data() as DocumentData);
}

export async function updateWebsite(
  uid: string,
  websiteId: string,
  patch: Partial<Pick<Website, 'content' | 'thumbnailUrl'>>,
): Promise<Website> {
  const websiteRef = doc(firestoreDb, 'users', uid, 'websites', websiteId);
  await updateDoc(websiteRef, {
    ...patch,
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(websiteRef);
  return mapWebsite(snapshot.id, snapshot.data() as DocumentData);
}

export async function deleteWebsite(uid: string, websiteId: string) {
  const websiteRef = doc(firestoreDb, 'users', uid, 'websites', websiteId);
  await deleteDoc(websiteRef);
}

export async function publishWebsite(uid: string, websiteId: string): Promise<Website> {
  const websiteRef = doc(firestoreDb, 'users', uid, 'websites', websiteId);
  await updateDoc(websiteRef, {
    status: 'published',
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(websiteRef);
  return mapWebsite(snapshot.id, snapshot.data() as DocumentData);
}
