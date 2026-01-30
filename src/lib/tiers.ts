/**
 * Feature 2: Complete Tier System
 * Professional pricing and feature gating
 */

export type Tier = 'free' | 'pro' | 'hunter' | 'agency';

export interface TierLimits {
  extractionsPerMonth: number | 'unlimited';
  campaignGeneration: boolean;
  websiteBuilder: boolean;
  voiceCommands: boolean;
  automation: boolean;
  videoGeneration: boolean;
  pdfExport: boolean;
  deepBrandScan: boolean;
  teamMembers: number | 'unlimited';
  support: 'community' | 'email' | 'priority' | 'dedicated';
  whiteLabel: boolean;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    extractionsPerMonth: 3,
    campaignGeneration: false,
    websiteBuilder: false,
    voiceCommands: false,
    automation: false,
    videoGeneration: false,
    pdfExport: false,
    deepBrandScan: false,
    teamMembers: 1,
    support: 'community',
    whiteLabel: false,
  },
  pro: {
    extractionsPerMonth: 'unlimited',
    campaignGeneration: true,
    websiteBuilder: true,
    voiceCommands: false,
    automation: true,
    videoGeneration: false,
    pdfExport: true,
    deepBrandScan: true,
    teamMembers: 1,
    support: 'email',
    whiteLabel: false,
  },
  hunter: {
    extractionsPerMonth: 'unlimited',
    campaignGeneration: true,
    websiteBuilder: true,
    voiceCommands: true,
    automation: true,
    videoGeneration: true,
    pdfExport: true,
    deepBrandScan: true,
    teamMembers: 3,
    support: 'priority',
    whiteLabel: false,
  },
  agency: {
    extractionsPerMonth: 'unlimited',
    campaignGeneration: true,
    websiteBuilder: true,
    voiceCommands: true,
    automation: true,
    videoGeneration: true,
    pdfExport: true,
    deepBrandScan: true,
    teamMembers: 'unlimited',
    support: 'dedicated',
    whiteLabel: true,
  },
};

export const TIER_PRICES: Record<Tier, number | null> = {
  free: 0,
  pro: 49,
  hunter: 149,
  agency: null, // Custom pricing
};

export const TIER_NAMES: Record<Tier, string> = {
  free: 'Free',
  pro: 'Pro',
  hunter: 'Hunter',
  agency: 'Agency',
};

export const TIER_DESCRIPTIONS: Record<Tier, string> = {
  free: 'Get started with brand intelligence',
  pro: 'Complete agency toolkit',
  hunter: 'Full automation for growing agencies',
  agency: 'White-label for enterprises',
};

export const TIER_BADGES: Record<Tier, string | null> = {
  free: null,
  pro: '🔥 Most Popular',
  hunter: '⚡ Best Value',
  agency: '🏢 Enterprise',
};

export function hasFeatureAccess(userTier: Tier, feature: keyof TierLimits): boolean {
  const limits = TIER_LIMITS[userTier];
  const value = limits[feature];

  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (value === 'unlimited') return true;
  return false;
}

export function canExtract(userTier: Tier, currentMonthExtractions: number): boolean {
  const limit = TIER_LIMITS[userTier].extractionsPerMonth;
  if (limit === 'unlimited') return true;
  return currentMonthExtractions < limit;
}

export function getCurrentTier(userId: string): Tier {
  try {
    const tierData = localStorage.getItem(`user_tier_${userId}`);
    return (tierData as Tier) || 'free';
  } catch {
    return 'free';
  }
}

export function setUserTier(userId: string, tier: Tier): void {
  localStorage.setItem(`user_tier_${userId}`, tier);
}

export function getMonthlyExtractionCount(userId: string): number {
  try {
    const data = localStorage.getItem(`extractions_${userId}`);
    if (!data) return 0;
    const parsed = JSON.parse(data);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    return parsed.filter((e: any) => new Date(e.timestamp) >= thisMonth).length;
  } catch {
    return 0;
  }
}

export function addExtraction(userId: string): void {
  try {
    const existing = localStorage.getItem(`extractions_${userId}`);
    const extractions = existing ? JSON.parse(existing) : [];
    extractions.push({ timestamp: new Date().toISOString() });
    localStorage.setItem(`extractions_${userId}`, JSON.stringify(extractions));
  } catch {
    // Silent fail
  }
}
