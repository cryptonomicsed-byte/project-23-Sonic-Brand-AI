/**
 * Feature 4: Video Generation Service
 * Handles multi-engine video generation with tier-based access
 */

export type VideoEngine = 'ltx2' | 'sora2' | 'veo3';

export interface VideoGenerationRequest {
  imageUrl: string;
  prompt: string;
  engine?: VideoEngine;
  userId: string;
  tier: string;
}

export interface VideoGenerationResponse {
  videoUrl: string;
  engineUsed: VideoEngine;
  costCredits: number;
  generatedAt: string;
}

// Mock API calls (replace with real endpoints)
async function callLTX2API(imageUrl: string, prompt: string): Promise<string> {
  console.log('🎬 Calling LTX-2 API');
  return `https://example.com/videos/ltx2_${Date.now()}.mp4`;
}

async function callSora2API(imageUrl: string, prompt: string): Promise<string> {
  console.log('🎬 Calling Sora 2 Pro API');
  return `https://example.com/videos/sora2_${Date.now()}.mp4`;
}

async function callVeo3API(imageUrl: string, prompt: string): Promise<string> {
  console.log('🎬 Calling Veo 3 API');
  return `https://example.com/videos/veo3_${Date.now()}.mp4`;
}

export async function canGenerateVideo(userId: string, tier: string): Promise<boolean> {
  const videoLog = localStorage.getItem(`video_log_${userId}`);
  let videoCount = 0;

  if (videoLog) {
    try {
      const logs = JSON.parse(videoLog) as Array<{ timestamp: number }>;
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      videoCount = logs.filter(log => log.timestamp >= thisMonth.getTime()).length;
    } catch (e) {
      console.error('Failed to parse video log', e);
    }
  }

  const limits: Record<string, number> = {
    free: 5,
    pro: 50,
    hunter: Infinity,
    agency: Infinity,
  };

  return videoCount < (limits[tier] || 0);
}

export async function getRemainingVideos(userId: string, tier: string): Promise<number> {
  const videoLog = localStorage.getItem(`video_log_${userId}`);
  let videoCount = 0;

  if (videoLog) {
    try {
      const logs = JSON.parse(videoLog) as Array<{ timestamp: number }>;
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      videoCount = logs.filter(log => log.timestamp >= thisMonth.getTime()).length;
    } catch (e) {
      console.error('Failed to parse video log', e);
    }
  }

  const limits: Record<string, number> = {
    free: 5,
    pro: 50,
    hunter: Infinity,
    agency: Infinity,
  };

  const limit = limits[tier] || 0;
  return limit === Infinity ? Infinity : limit - videoCount;
}

async function deductCredits(userId: string, amount: number): Promise<void> {
  const userCredits = localStorage.getItem(`credits_${userId}`);
  const current = userCredits ? parseInt(userCredits, 10) : 0;
  localStorage.setItem(`credits_${userId}`, String(Math.max(0, current - amount)));
}

async function logVideoGeneration(data: {
  userId: string;
  engine: VideoEngine;
  credits: number;
}): Promise<void> {
  const videoLog = localStorage.getItem(`video_log_${data.userId}`);
  const logs = videoLog ? JSON.parse(videoLog) : [];
  logs.push({
    timestamp: Date.now(),
    engine: data.engine,
    credits: data.credits,
  });
  localStorage.setItem(`video_log_${data.userId}`, JSON.stringify(logs));
}

export async function generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
  const { imageUrl, prompt, engine = 'ltx2', userId, tier } = request;

  // Check tier access
  if (!(await canGenerateVideo(userId, tier))) {
    throw new Error(`Monthly video limit reached for ${tier} tier`);
  }

  // Restrict premium engines to Hunter+
  if (engine !== 'ltx2' && !['hunter', 'agency'].includes(tier)) {
    throw new Error(`${engine} available for Hunter tier and above`);
  }

  let videoUrl: string;
  let costCredits: number;

  switch (engine) {
    case 'sora2':
      videoUrl = await callSora2API(imageUrl, prompt);
      costCredits = tier === 'hunter' ? 5 : 0;
      break;
    case 'veo3':
      videoUrl = await callVeo3API(imageUrl, prompt);
      costCredits = tier === 'hunter' ? 5 : 0;
      break;
    default:
      videoUrl = await callLTX2API(imageUrl, prompt);
      costCredits = tier === 'hunter' || tier === 'agency' ? 1 : 0;
  }

  if (costCredits > 0) {
    await deductCredits(userId, costCredits);
  }

  await logVideoGeneration({ userId, engine, credits: costCredits });

  return {
    videoUrl,
    engineUsed: engine,
    costCredits,
    generatedAt: new Date().toISOString(),
  };
}

export function getVideoTierInfo(tier: string) {
  const tiers: Record<string, any> = {
    free: {
      monthlyLimit: 5,
      engines: ['ltx2'],
      note: 'LTX-2 for social media shorts',
    },
    pro: {
      monthlyLimit: 50,
      engines: ['ltx2'],
      note: 'LTX-2 optimized for content creators',
    },
    hunter: {
      monthlyLimit: Infinity,
      engines: ['ltx2', 'sora2', 'veo3'],
      note: 'All premium engines available',
    },
    agency: {
      monthlyLimit: Infinity,
      engines: ['ltx2', 'sora2', 'veo3'],
      note: 'Unlimited access to all engines',
    },
  };

  return tiers[tier] || tiers.free;
}
