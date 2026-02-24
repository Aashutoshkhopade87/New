import type { Website } from '../types/website';

const DRAFTS_KEY = 'tezweb_local_drafts';

export function saveLocalDraft(website: Website) {
  const drafts = getLocalDrafts();
  const next = [website, ...drafts.filter((item) => item.id !== website.id)];
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
}

export function getLocalDrafts(): Website[] {
  const raw = localStorage.getItem(DRAFTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Website[];
  } catch {
    return [];
  }
}
