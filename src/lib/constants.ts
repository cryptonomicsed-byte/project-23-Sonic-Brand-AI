export const TIERS = {
  free: {
    price: 0,
    extractionsPerMonth: 3,
    features: ['basic_extraction', 'dashboard'],
  },
  pro: {
    price: 49,
    extractionsPerMonth: Infinity,
    features: ['all_providers', 'campaigns', 'websites', 'leads', 'scheduler'],
  },
  hunter: {
    price: 149,
    extractionsPerMonth: Infinity,
    features: ['all_pro', 'voice', 'automations', 'agent_forge', 'live_sessions'],
  },
  agency: {
    price: 'custom',
    extractionsPerMonth: Infinity,
    features: ['all_hunter', 'white_label', 'team_seats', 'support'],
  },
};

export const LLM_PROVIDERS = [
  'openai',
  'claude',
  'gemini',
  'mistral',
  'groq',
  'cohere',
];

export const IMAGE_PROVIDERS = [
  'openai',
  'stability',
  'midjourney',
  'replicate',
];

export const VOICE_PROVIDERS = [
  'elevenlabs',
  'google',
  'azure',
  'aws-polly',
];
