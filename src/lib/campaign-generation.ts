import { BrandDNA } from '$types';
import { callLLM, getCampaignPrompt } from './llm-sdk';

export interface SocialPost {
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook';
  content: string;
  hashtags: string[];
  callToAction: string;
  imagePrompt?: string;
}

export interface EmailContent {
  subject: string;
  body: string;
  cta: string;
  ctaUrl: string;
}

export interface AdCopy {
  headline: string;
  body: string;
  cta: string;
  audience: string;
}

export interface BlogPost {
  title: string;
  subtitle: string;
  content: string;
  callToAction: string;
}

export interface VideoScript {
  title: string;
  duration: number;
  scenes: {
    description: string;
    voiceover: string;
  }[];
}

export interface CampaignAssets {
  social: {
    posts: SocialPost[];
    images: string[];
  };
  email: EmailContent;
  ads: {
    copy: AdCopy[];
    images: string[];
    targeting: string;
  };
  content: {
    blogPosts: BlogPost[];
    videos: VideoScript[];
  };
}

async function generateSocialContent(
  brandDNA: BrandDNA,
  objective: string,
  llmModel: string
): Promise<{ posts: SocialPost[] }> {
  const prompt = `${getCampaignPrompt(brandDNA, objective, 'social')}

Generate 4 compelling social media posts (for Twitter, Instagram, LinkedIn, Facebook) that promote: ${objective}

Return ONLY JSON array of posts with structure:
[{
  "platform": "twitter|instagram|linkedin|facebook",
  "content": "post text (platform-appropriate length)",
  "hashtags": ["tag1", "tag2"],
  "callToAction": "action text",
  "imagePrompt": "description for AI image generation"
}]`;

  const response = await callLLM({ model: llmModel, prompt, temperature: 0.8 });
  const jsonMatch = response.content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Invalid social content response');

  return {
    posts: JSON.parse(jsonMatch[0]),
  };
}

async function generateEmailContent(
  brandDNA: BrandDNA,
  objective: string,
  llmModel: string
): Promise<EmailContent> {
  const prompt = `${getCampaignPrompt(brandDNA, objective, 'email')}

Generate an email campaign with subject, body, and CTA for: ${objective}

Return ONLY JSON:
{
  "subject": "compelling subject line",
  "body": "email body with multiple paragraphs",
  "cta": "button text",
  "ctaUrl": "https://example.com/path"
}`;

  const response = await callLLM({ model: llmModel, prompt, temperature: 0.7 });
  const jsonMatch = response.content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid email content response');

  return JSON.parse(jsonMatch[0]);
}

async function generateAdCopy(
  brandDNA: BrandDNA,
  objective: string,
  llmModel: string
): Promise<{ copy: AdCopy[] }> {
  const prompt = `${getCampaignPrompt(brandDNA, objective, 'ads')}

Generate 3 high-converting ad variations for: ${objective}

Return ONLY JSON array:
[{
  "headline": "punchy headline (max 30 chars)",
  "body": "compelling ad copy",
  "cta": "button text",
  "audience": "target audience description"
}]`;

  const response = await callLLM({ model: llmModel, prompt, temperature: 0.8 });
  const jsonMatch = response.content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Invalid ad copy response');

  return {
    copy: JSON.parse(jsonMatch[0]),
  };
}

async function generateContentAssets(
  brandDNA: BrandDNA,
  objective: string,
  llmModel: string
): Promise<{ blogPosts: BlogPost[]; videos: VideoScript[] }> {
  const prompt = `${getCampaignPrompt(brandDNA, objective, 'content')}

Generate 1 blog post and 1 video script for: ${objective}

Return ONLY JSON:
{
  "blogPosts": [{
    "title": "engaging title",
    "subtitle": "subtitle",
    "content": "full blog post (500+ words)",
    "callToAction": "end with CTA"
  }],
  "videos": [{
    "title": "video title",
    "duration": 60,
    "scenes": [{
      "description": "visual description",
      "voiceover": "script"
    }]
  }]
}`;

  const response = await callLLM({ model: llmModel, prompt, temperature: 0.7 });
  const jsonMatch = response.content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid content response');

  return JSON.parse(jsonMatch[0]);
}

export async function generateCampaignAssets(
  brandDNA: BrandDNA,
  objective: string,
  channels: string[],
  llmModel: string
): Promise<CampaignAssets> {
  const results = await Promise.all([
    channels.includes('social') ? generateSocialContent(brandDNA, objective, llmModel) : Promise.resolve({ posts: [] }),
    channels.includes('email') ? generateEmailContent(brandDNA, objective, llmModel) : Promise.resolve({} as EmailContent),
    channels.includes('ads') ? generateAdCopy(brandDNA, objective, llmModel) : Promise.resolve({ copy: [] }),
    channels.includes('content') ? generateContentAssets(brandDNA, objective, llmModel) : Promise.resolve({ blogPosts: [], videos: [] }),
  ]);

  return {
    social: {
      posts: results[0].posts,
      images: [],
    },
    email: results[1],
    ads: {
      copy: results[2].copy,
      images: [],
      targeting: brandDNA.audience.demographics,
    },
    content: {
      blogPosts: results[3].blogPosts,
      videos: results[3].videos,
    },
  };
}
