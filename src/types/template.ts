import type { DesignConfig } from './design';

export type Template = {
  id: string;
  name: string;
  imageUrl: string;
};

export type UserProfile = {
  uid: string;
  phone: string | null;
  fullName?: string | null;
  templateId?: string;
  designConfig?: DesignConfig;
  trialEndsAt?: unknown;
  subscriptionStatus?: 'inactive' | 'active' | 'expired';
  paidUntil?: unknown;
  plan?: 'trial' | 'pro';
  maxWebsites?: number;
};
