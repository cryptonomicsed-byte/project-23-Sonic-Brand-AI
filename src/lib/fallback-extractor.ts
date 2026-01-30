/**
 * Fallback Extractor
 * Provides real brand data extraction using only scraped content
 * No LLM required - works offline or when APIs are unavailable
 */

import type { ScraperResult } from './scraper';

export function extractBrandDataFromScraper(scraperData: ScraperResult, url: string): any {
  const { metadata, styling, content, assets, social, text } = scraperData;

  // Extract mission/vision from headings and meta description
  const mission = metadata.description || content.headings[0] || 'Professional brand';
  const headings = content.headings.filter(h => h.length > 10 && h.length < 200);
  const vision = headings[1] || 'Committed to delivering quality and innovation';

  // Extract values from content keywords and messaging
  const extractedValues = [
    'Innovation',
    'Quality',
    'Customer Focus',
    ...content.keyPhrases.slice(0, 2),
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);

  // Build tagline
  const tagline = metadata.title || headings[0] || 'Excellence in every detail';

  // Get actual colors from styling
  const colors = styling.colors.length > 0 
    ? styling.colors.slice(0, 5).map(c => c.hex)
    : ['#3B82F6', '#10B981'];

  // Get actual fonts from styling
  const fonts = styling.fonts.length > 0
    ? styling.fonts.slice(0, 3).map(f => f.family)
    : ['System UI'];

  // Extract visual style from color analysis
  const colorCount = styling.colors.length;
  let visualStyle = 'Modern and professional';
  if (colorCount > 8) visualStyle = 'Bold and vibrant';
  else if (colorCount > 5) visualStyle = 'Rich and layered';
  else if (colorCount <= 2) visualStyle = 'Minimalist and clean';

  // Analyze tone from content
  const tones = analyzeToneFromContent(text, content.messaging);

  // Get keywords from content
  const keywords = content.keyPhrases.slice(0, 5).length > 0 
    ? content.keyPhrases.slice(0, 5)
    : ['quality', 'innovation', 'excellence'];

  // Determine writing style from content analysis
  const writingStyle = analyzeWritingStyle(content, text);

  // Extract demographics from content signals
  const { demographics, psychographics, painPoints } = inferAudience(content, text);

  // Market positioning
  const positioning = inferMarketPosition(mission, content);
  
  // Potential competitors (generic but contextual)
  const competitors = ['Industry leaders', 'Market competitors'];

  return {
    core: {
      mission,
      vision,
      values: extractedValues,
      tagline,
    },
    identity: {
      colors,
      fonts,
      visualStyle,
      logoUrl: assets.logos[0]?.url || undefined,
    },
    voice: {
      tone: tones,
      keywords,
      writingStyle,
    },
    audience: {
      demographics,
      psychographics,
      painPoints,
    },
    market: {
      positioning,
      competitors,
    },
    id: `dna_${Date.now()}`,
    websiteUrl: url,
    createdAt: new Date().toISOString(),
    scrapedMetadata: {
      pageTitle: metadata.title,
      metaDescription: metadata.description,
      ogImage: metadata.ogImage,
    },
    detectedAssets: {
      logos: assets.logos.slice(0, 3),
      heroImages: assets.heroImages.slice(0, 3),
    },
    socialPresence: social.links.map((link: any) => ({
      platform: link.platform,
      url: link.url,
    })),
    extractionMethod: 'scraper-only',
  };
}

function analyzeToneFromContent(text: string, messaging: string[]): string[] {
  const tones: string[] = [];
  const fullText = (text + ' ' + messaging.join(' ')).toLowerCase();

  const patterns: Record<string, RegExp> = {
    professional: /professional|corporate|enterprise|business|solution|optimize/i,
    energetic: /fun|cool|awesome|exciting|vibrant|dynamic|thrilling/i,
    creative: /creative|design|beautiful|elegant|aesthetic|artistic|inspiring/i,
    innovative: /innovative|cutting-edge|breakthrough|advanced|revolutionary|future/i,
    empathetic: /care|support|help|community|together|understand|listen|human/i,
    authoritative: /expert|trusted|reliable|secure|proven|leader|industry|established/i,
    casual: /friendly|approachable|relatable|conversational|easy|simple|straightforward/i,
    premium: /premium|luxury|exclusive|elite|high-end|sophisticated/i,
  };

  for (const [tone, pattern] of Object.entries(patterns)) {
    if (pattern.test(fullText)) {
      tones.push(tone);
    }
  }

  return tones.length > 0 ? tones.slice(0, 5) : ['professional', 'approachable'];
}

function analyzeWritingStyle(content: { messaging: string[]; callToActions: string[] }, text: string): string {
  const hasHighCTA = content.callToActions.length >= 3;
  const hasLongForm = content.messaging.some(m => m.length > 200);
  const isFormal = /therefore|moreover|consequently|utilize|implement/i.test(text);
  const isCasual = /hey|let's|don't|we're|honestly|actually/i.test(text);

  if (isFormal && hasLongForm) return 'Formal and detailed';
  if (isCasual && hasHighCTA) return 'Conversational and persuasive';
  if (hasHighCTA) return 'Action-oriented and engaging';
  if (hasLongForm) return 'Informative and comprehensive';
  
  return 'Clear and concise';
}

function inferAudience(content: { messaging: string[]; keyPhrases: string[] }, text: string) {
  const textLower = text.toLowerCase();

  let demographics = 'Business professionals and decision makers';
  let psychographics = 'Value quality and innovation';
  const painPoints: string[] = ['efficiency', 'reliability'];

  // Detect target audience from content signals
  if (/student|learn|education|course|training/i.test(textLower)) {
    demographics = 'Students and learners';
    psychographics = 'Seeking knowledge and growth';
    painPoints[0] = 'accessibility';
  }
  if (/enterprise|corporate|b2b|business|organization/i.test(textLower)) {
    demographics = 'Enterprise organizations and executives';
    psychographics = 'Focus on ROI and scalability';
    painPoints[0] = 'integration';
  }
  if (/creator|freelance|startup|small business/i.test(textLower)) {
    demographics = 'Creators and entrepreneurs';
    psychographics = 'Value autonomy and efficiency';
    painPoints[0] = 'cost-effectiveness';
  }
  if (/consumer|customer|user|people/i.test(textLower)) {
    demographics = 'End consumers and everyday users';
    psychographics = 'Seek convenience and value';
    painPoints[0] = 'usability';
  }

  painPoints.push('cost-effectiveness');

  return { demographics, psychographics, painPoints };
}

function inferMarketPosition(mission: string, content?: { messaging: string[] }): string {
  const allText = (mission + ' ' + (content?.messaging || []).join(' ')).toLowerCase();

  if (/premium|luxury|exclusive|high-end/i.test(allText)) {
    return 'Premium market leader';
  }
  if (/affordable|budget|accessible|value/i.test(allText)) {
    return 'Value-focused provider';
  }
  if (/innovative|disrupt|revolution|next-gen/i.test(allText)) {
    return 'Innovation pioneer';
  }
  if (/sustainable|green|ethical|responsible/i.test(allText)) {
    return 'Sustainability-focused leader';
  }

  return 'Quality-focused provider in their category';
}
