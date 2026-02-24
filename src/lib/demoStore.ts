import { generateDesignConfig } from './designGenerator';
import type { UserProfile } from '../types/template';
import type { Website } from '../types/website';

export const DEMO_UID = 'demo-user';

const PROFILE_KEY = 'tezweb_demo_profile';
const WEBSITES_KEY = 'tezweb_demo_websites';

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function nowPlusDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function isDemoUid(uid: string) {
  return uid === DEMO_UID;
}

export function getDemoProfile(): UserProfile {
  const existing = safeParse<UserProfile | null>(localStorage.getItem(PROFILE_KEY), null);
  if (existing) return existing;

  const profile: UserProfile = {
    uid: DEMO_UID,
    phone: '+919999999999',
    fullName: 'Demo User',
    templateId: 'modern-portfolio',
    designConfig: generateDesignConfig('demo-seed', 'modern-portfolio'),
    trialEndsAt: nowPlusDays(7),
    subscriptionStatus: 'inactive',
    paidUntil: null,
    plan: 'trial',
    maxWebsites: 1,
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function setDemoProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function listDemoWebsites(): Website[] {
  return safeParse<Website[]>(localStorage.getItem(WEBSITES_KEY), []);
}

export function saveDemoWebsite(website: Website) {
  const websites = listDemoWebsites();
  const next = [website, ...websites.filter((item) => item.id !== website.id)];
  localStorage.setItem(WEBSITES_KEY, JSON.stringify(next));
}

export function replaceDemoWebsites(websites: Website[]) {
  localStorage.setItem(WEBSITES_KEY, JSON.stringify(websites));
}

export function removeDemoWebsite(websiteId: string) {
  replaceDemoWebsites(listDemoWebsites().filter((site) => site.id !== websiteId));
}
