export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

export type Tier = 'free' | 'pro' | 'hunter' | 'agency';

export type LLMProvider = 
  // Major Players
  | 'openai' | 'claude' | 'gemini' | 'mistral' | 'groq' | 'cohere'
  // Additional LLM providers
  | 'deepseek' | 'llama' | 'qwen' | 'perplexity' | 'openrouter'
  | 'together' | 'replicate' | 'azure-openai' | 'cerebras' | 'sambanova'
  | 'hyperbolic' | 'nebius' | 'friendli' | 'aws-bedrock' | 'ollama'
  | 'hunyuan' | 'minimax' | 'blackbox' | 'dify' | 'venice'
  | 'custom';

export type ImageProvider = 
  // Leaders
  | 'dalle3' | 'dalle4' | 'gemini-imagen' | 'flux-pro'
  // Specialist
  | 'stable-diffusion' | 'adobe-firefly' | 'amazon-titan'
  // Additional image providers
  | 'midjourney' | 'recraft' | 'leonardo' | 'runware' | 'grok-image'
  | 'bria' | 'deepai' | 'replicate-image' | 'segmind' | 'prodia'
  | 'ideogram' | 'black-forest' | 'wan' | 'hunyuan-image' | 'custom';

export type VideoProvider =
  // Cutting-Edge
  | 'sora2' | 'veo3' | 'runway-gen3'
  // High-Quality
  | 'ltx-video' | 'kling' | 'luma-dream' | 'mochi'
  | 'wan-video' | 'hunyuan-video' | 'wanx' | 'hailuoai'
  // Specialized
  | 'pixverse' | 'heygen' | 'pika' | 'synthesia' | 'deepbrain'
  | 'colossyan' | 'higgsfield' | 'fal' | 'replicate-video'
  | 'fireworks-video' | 'wavespeed' | 'custom';

export type VoiceProvider =
  // Premium
  | 'elevenlabs' | 'openai-tts' | 'playht'
  // High-Performance
  | 'cartesia' | 'resemble' | 'murf' | 'wellsaid'
  // Alternative
  | 'deepgram' | 'lmnt' | 'fish-audio' | 'rime' | 'neets'
  | 'speechify' | 'amazon-polly' | 'google-tts' | 'azure-speech'
  | 'piper-local' | 'custom';

export interface UserSettings {
  userId: string;
  tier: Tier;
  extractionsUsed: number;
  extractionsLimit: number;
  llmProvider: LLMProvider;
  imageProvider: ImageProvider;
  videoProvider: VideoProvider;
  voiceProvider: VoiceProvider;
  preferences?: Record<string, any>;
  updatedAt: string;
}

export interface APIKeys {
  llm: Record<string, string>;
  image: Record<string, string>;
  voice: Record<string, string>;
  video: Record<string, string>;
  automation: Record<string, string>;
}

export interface Affiliate {
  id: string;
  userId: string;
  referralCode: string;
  conversions: number;
  earnings: number;
  createdAt: string;
}
