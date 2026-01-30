/**
 * Enhanced Brand DNA Extractor - CoreDNA2 Inspired
 * 
 * Provides deep, multi-dimensional brand analysis:
 * - Visual Identity (colors, fonts, design language)
 * - Brand Positioning (market, competitors, differentiation)
 * - Content Strategy (messaging, tone, keywords, CTAs)
 * - Audience Intelligence (demographics, psychographics, personas)
 * - Voice & Personality (writing style, tone, brand archetypes)
 * - Market Analysis (positioning, competitive landscape)
 */

import { scrapeWebsite, type SimpleScrapedData } from './simple-scraper';

export interface EnhancedBrandDNA {
  id: string;
  websiteUrl: string;
  createdAt: string;
  
  // Core Brand Identity
  core: {
    mission: string;
    vision: string;
    tagline: string;
    values: string[];
    purpose: string;  // NEW: deeper purpose
    promise: string;  // NEW: brand promise
  };

  // Visual Identity (Enhanced)
  identity: {
    colors: Array<{
      hex: string;
      name: string;
      usage: string;
      psychology?: string;
    }>;
    fonts: Array<{
      family: string;
      usage: string;
      personality?: string;
    }>;
    visualStyle: string;
    designLanguage: string;  // NEW: minimalist, bold, luxury, etc
    logoUrl?: string;
    logoDescription?: string;  // NEW
  };

  // Brand Voice (Enhanced)
  voice: {
    tone: string[];
    keywords: string[];
    writingStyle: string;
    archetypes: string[];  // NEW: Hero, Sage, Creator, Lover, etc
    coreMessage: string;   // NEW: main brand message
    moodBoard: string[];   // NEW: emotional associations
  };

  // Audience Intelligence (Enhanced)
  audience: {
    demographics: string;
    psychographics: string;
    painPoints: string[];
    desires: string[];     // NEW: what they want
    personas: Array<{      // NEW: detailed personas
      name: string;
      description: string;
      goals: string[];
    }>;
  };

  // Market Position (Enhanced)
  market: {
    positioning: string;
    competitors: string[];
    differentiation: string[];  // NEW: what makes them unique
    marketSize?: string;        // NEW: target market size
    opportunities?: string[];   // NEW: growth opportunities
  };

  // Content Strategy (NEW)
  contentStrategy?: {
    mainThemes: string[];
    callToActions: string[];
    contentTone: string;
    keyMessages: string[];
  };

  // Confidence Scores (NEW)
  confidence?: {
    visual: number;      // 0-100
    positioning: number;
    tone: number;
    overall: number;
  };

  extractionMethod: string;
}

export async function extractEnhancedBrandDNA(url: string): Promise<EnhancedBrandDNA> {
  try {
    console.log('[EnhancedExtractor] Starting deep brand analysis for:', url);

    // Step 1: Scrape the website
    const scrapedData = await scrapeWebsite(url);
    console.log('[EnhancedExtractor] ✓ Website scraped');

    // Step 2: Deep analysis
    const dna = analyzeDeepBrandDNA(scrapedData, url);
    console.log('[EnhancedExtractor] ✓ Deep analysis complete');

    return dna;
  } catch (error) {
    console.error('[EnhancedExtractor] Error:', error);
    throw error;
  }
}

function analyzeDeepBrandDNA(data: SimpleScrapedData, url: string): EnhancedBrandDNA {
  const { title, description, text, headings, colors, fonts, images } = data;

  // Core Identity - Deep
  const mission = buildMission(headings, description, text);
  const vision = buildVision(headings, text);
  const tagline = buildTagline(headings, title, text);
  const values = extractValues(text);
  const purpose = buildPurpose(text, description);
  const promise = buildBrandPromise(headings, text);

  // Visual Identity - Enhanced
  const visualIdentity = analyzeVisualIdentity(colors, fonts, text);

  // Brand Voice - Enhanced
  const voice = analyzeEnhancedVoice(text, headings);

  // Audience - Enhanced with personas
  const audience = inferAudienceWithPersonas(text);

  // Market - Enhanced with differentiation
  const market = inferEnhancedMarketPosition(text, mission);

  // Content Strategy
  const contentStrategy = extractContentStrategy(headings, text);

  // Confidence Scores
  const confidence = calculateConfidenceScores(data, mission, voice);

  return {
    id: `dna_${Date.now()}`,
    websiteUrl: url,
    createdAt: new Date().toISOString(),
    core: {
      mission,
      vision,
      tagline,
      values,
      purpose,
      promise,
    },
    identity: visualIdentity,
    voice,
    audience,
    market,
    contentStrategy,
    confidence,
    extractionMethod: 'enhanced-deep-analysis',
  };
}

function analyzeVisualIdentity(colors: string[], fonts: string[], text: string) {
  const colorDetails = colors.map((hex, index) => ({
    hex,
    name: getColorName(hex),
    usage: getColorUsage(hex, text, index),
    psychology: getColorPsychology(hex),
  }));

  const fontDetails = fonts.map(font => ({
    family: font,
    usage: inferFontUsage(font, text),
    personality: inferFontPersonality(font),
  }));

  return {
    colors: colorDetails,
    fonts: fontDetails,
    visualStyle: determineVisualStyle(colors, text),
    designLanguage: inferDesignLanguage(colors, fonts, text),
    logoUrl: undefined,
    logoDescription: undefined,
  };
}

function analyzeEnhancedVoice(text: string, headings: string[]) {
  const tone = analyzeTone(text);
  const keywords = extractKeywords(text);
  const writingStyle = analyzeWritingStyle(text);
  const archetypes = detectBrandArchetypes(text);
  const coreMessage = extractCoreMessage(headings, text);
  const moodBoard = createMoodBoard(text);

  return {
    tone,
    keywords,
    writingStyle,
    archetypes,
    coreMessage,
    moodBoard,
  };
}

function inferAudienceWithPersonas(text: string) {
  const { demographics, psychographics, painPoints } = inferAudience(text);
  const desires = inferDesires(text);
  const personas = buildPersonas(demographics, text);

  return {
    demographics,
    psychographics,
    painPoints,
    desires,
    personas,
  };
}

function inferEnhancedMarketPosition(text: string, mission: string) {
  const positioning = inferPositioning(text, mission);
  const competitors = inferCompetitors(text);
  const differentiation = identifyDifferentiation(text, mission);
  const marketSize = inferMarketSize(text);
  const opportunities = inferOpportunities(text);

  return {
    positioning,
    competitors,
    differentiation,
    marketSize,
    opportunities,
  };
}

// Helper Functions

function buildMission(headings: string[], description: string, text: string): string {
  if (description && description.length > 30) return description;
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20 && s.trim().length < 250);
  for (const sentence of sentences.slice(0, 3)) {
    if (/(helps|provides|connects|enables|serves|offers|delivers)/i.test(sentence)) {
      return sentence.trim();
    }
  }

  if (headings.length > 0) {
    const substantialHeadings = headings.filter(h => h.length > 20 && h.length < 150);
    return substantialHeadings[0] || headings[0];
  }

  return sentences[0]?.trim() || 'Professional brand';
}

function buildVision(headings: string[], text: string): string {
  const visionKeywords = ['vision', 'future', 'innovate', 'transform', 'next', 'tomorrow'];
  
  for (const heading of headings.slice(1, 5)) {
    if (visionKeywords.some(kw => heading.toLowerCase().includes(kw))) {
      return heading;
    }
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
  for (const sentence of sentences.slice(1, 5)) {
    if (visionKeywords.some(kw => sentence.toLowerCase().includes(kw))) {
      return sentence.trim();
    }
  }

  return 'Leading with innovation and customer focus';
}

function buildTagline(headings: string[], title: string, text: string): string {
  const shortHeadings = headings.filter(h => h.length < 100 && h.length > 10);
  const valuePatterns = /(best|quality|great|amazing|perfect|innovative|fast|easy|simple|powerful|trusted|unique)/i;
  const valueHeadings = shortHeadings.filter(h => valuePatterns.test(h));
  
  if (valueHeadings.length > 0) return valueHeadings[0];

  if (shortHeadings.length > 0) {
    return shortHeadings[Math.min(2, shortHeadings.length - 1)];
  }

  return title || 'Excellence in every detail';
}

function buildPurpose(text: string, description: string): string {
  // Deeper purpose statement
  const purposeIndicators = /(mission|purpose|believe|committed to|dedicated to|strive|aim)/i;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
  
  for (const sentence of sentences) {
    if (purposeIndicators.test(sentence) && sentence.length < 200) {
      return sentence.trim();
    }
  }

  return description || 'Creating meaningful value for customers';
}

function buildBrandPromise(headings: string[], text: string): string {
  const promiseKeywords = /(guarantee|promise|commitment|delivers|ensures|provides)/i;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  for (const sentence of sentences) {
    if (promiseKeywords.test(sentence)) {
      return sentence.trim();
    }
  }

  return headings[0] || 'Delivering quality and innovation';
}

function extractValues(text: string): string[] {
  const valueKeywords = [
    'innovation', 'quality', 'integrity', 'customer', 'trust', 'excellence',
    'sustainability', 'growth', 'transparency', 'reliability', 'creativity',
  ];

  const foundValues: string[] = [];
  const lowerText = text.toLowerCase();

  for (const value of valueKeywords) {
    if (new RegExp(`\\b${value}s?\\b`, 'i').test(lowerText)) {
      foundValues.push(value.charAt(0).toUpperCase() + value.slice(1));
    }
  }

  return foundValues.length > 0 ? foundValues.slice(0, 4) : ['Quality', 'Innovation', 'Customer Focus'];
}

function getColorName(hex: string): string {
  const colorNames: Record<string, string> = {
    '#cc0000': 'Red',
    '#ff0000': 'Bright Red',
    '#000000': 'Black',
    '#ffffff': 'White',
    '#3b82f6': 'Blue',
    '#10b981': 'Green',
    '#f59e0b': 'Amber',
    '#ef4444': 'Red',
    '#8b5cf6': 'Purple',
  };

  return colorNames[hex.toLowerCase()] || 'Color';
}

function getColorUsage(hex: string, text: string, index: number): string {
  const usages = ['Primary', 'Secondary', 'Accent', 'Highlight', 'Background'];
  return usages[index] || 'Accent';
}

function getColorPsychology(hex: string): string {
  const psychology: Record<string, string> = {
    '#cc0000': 'Energy, Passion, Urgency',
    '#3b82f6': 'Trust, Calmness, Stability',
    '#10b981': 'Growth, Health, Nature',
    '#f59e0b': 'Optimism, Caution, Attention',
    '#8b5cf6': 'Creativity, Imagination, Luxury',
  };

  return psychology[hex.toLowerCase()] || 'Visual appeal';
}

function inferFontUsage(font: string, text: string): string {
  return 'Typography';
}

function inferFontPersonality(font: string): string {
  const fontPersonality: Record<string, string> = {
    'inter': 'Modern, Clean, Approachable',
    'poppins': 'Friendly, Bold, Playful',
    'georgia': 'Classic, Elegant, Trustworthy',
    'monospace': 'Technical, Precision, Code',
  };

  const lower = font.toLowerCase();
  for (const [key, personality] of Object.entries(fontPersonality)) {
    if (lower.includes(key)) return personality;
  }

  return 'Professional';
}

function determineVisualStyle(colors: string[], text: string): string {
  const colorCount = colors.length;
  const lowerText = text.toLowerCase();

  if (/minimalist|clean|simple/i.test(lowerText)) return 'Minimalist and clean';
  if (/bold|vibrant|energetic/i.test(lowerText)) return 'Bold and vibrant';
  if (/elegant|sophisticated|luxury/i.test(lowerText)) return 'Elegant and sophisticated';

  if (colorCount > 8) return 'Rich and layered';
  if (colorCount <= 2) return 'Minimalist with limited palette';

  return 'Modern and professional';
}

function inferDesignLanguage(colors: string[], fonts: string[], text: string): string {
  if (colors.length > 6) return 'Diverse and colorful';
  if (colors.length <= 2) return 'Minimal and focused';
  
  return 'Balanced and accessible';
}

function analyzeTone(text: string): string[] {
  const tones: string[] = [];
  const lower = text.toLowerCase();

  if (/professional|corporate|business/i.test(lower)) tones.push('professional');
  if (/fun|cool|exciting|vibrant/i.test(lower)) tones.push('energetic');
  if (/creative|beautiful|elegant/i.test(lower)) tones.push('creative');
  if (/innovative|cutting-edge/i.test(lower)) tones.push('innovative');
  if (/empathy|care|community/i.test(lower)) tones.push('empathetic');
  if (/trusted|reliable|secure/i.test(lower)) tones.push('authoritative');

  return tones.length > 0 ? tones.slice(0, 5) : ['professional', 'approachable'];
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const freq: Record<string, number> = {};

  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  const stopwords = new Set([
    'the', 'and', 'for', 'with', 'from', 'that', 'your', 'which', 'they', 'will',
  ]);

  const keywords = Object.entries(freq)
    .filter(([word]) => !stopwords.has(word) && freq[word] > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  return keywords.length > 0 ? keywords : ['Quality', 'Innovation', 'Excellence'];
}

function analyzeWritingStyle(text: string): string {
  if (/therefore|moreover|utilize/i.test(text)) return 'Formal and detailed';
  if (/let's|don't|we're/i.test(text)) return 'Conversational and friendly';
  if (/must|critical|essential/i.test(text)) return 'Action-oriented';
  
  return 'Clear and concise';
}

function detectBrandArchetypes(text: string): string[] {
  const archetypes: string[] = [];
  const lower = text.toLowerCase();

  if (/leader|innovator|pioneer/i.test(lower)) archetypes.push('The Hero');
  if (/creator|build|make|design/i.test(lower)) archetypes.push('The Creator');
  if (/care|help|support|serve/i.test(lower)) archetypes.push('The Caregiver');
  if (/fun|play|joy|enjoy/i.test(lower)) archetypes.push('The Jester');
  if (/wisdom|insight|knowledge/i.test(lower)) archetypes.push('The Sage');

  return archetypes.length > 0 ? archetypes : ['The Expert'];
}

function extractCoreMessage(headings: string[], text: string): string {
  if (headings.length > 0) {
    const mainHeadings = headings.filter(h => h.length > 20 && h.length < 150);
    return mainHeadings[0] || headings[0];
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
  return sentences[0]?.trim() || 'Quality and innovation';
}

function createMoodBoard(text: string): string[] {
  const moods: string[] = [];
  const lower = text.toLowerCase();

  if (/success|growth|achievement/i.test(lower)) moods.push('Ambitious');
  if (/trust|safe|secure/i.test(lower)) moods.push('Trustworthy');
  if (/fun|playful|joyful/i.test(lower)) moods.push('Playful');
  if (/elegant|refined|luxury/i.test(lower)) moods.push('Sophisticated');
  if (/innovation|future|advanced/i.test(lower)) moods.push('Cutting-edge');

  return moods.length > 0 ? moods : ['Professional'];
}

function inferAudience(text: string) {
  const lower = text.toLowerCase();

  let demographics = 'Professionals';
  let psychographics = 'Value quality and innovation';
  const painPoints = ['efficiency'];

  if (/enterprise|corporate|b2b/i.test(lower)) {
    demographics = 'Enterprise organizations and executives';
    psychographics = 'Focus on ROI and scalability';
  }

  return { demographics, psychographics, painPoints };
}

function inferDesires(text: string): string[] {
  const desires: string[] = [];
  
  if (/success|growth|scale/i.test(text)) desires.push('Scalability');
  if (/efficiency|fast|quick/i.test(text)) desires.push('Speed');
  if (/trust|secure|safe/i.test(text)) desires.push('Security');
  if (/innovation|new|future/i.test(text)) desires.push('Innovation');

  return desires.length > 0 ? desires : ['Value'];
}

function buildPersonas(demographics: string, text: string): Array<{ name: string; description: string; goals: string[] }> {
  return [
    {
      name: 'Primary User',
      description: demographics,
      goals: ['Achieve goals', 'Improve efficiency', 'Grow business'],
    },
  ];
}

function identifyDifferentiation(text: string, mission: string): string[] {
  const diff: string[] = [];

  if (/unique|only|exclusive/i.test(text)) diff.push('Unique offering');
  if (/advanced|cutting-edge|innovative/i.test(text)) diff.push('Innovation leader');
  if (/affordable|value|budget/i.test(text)) diff.push('Value for money');
  if (/premium|quality|excellence/i.test(text)) diff.push('Quality focus');

  return diff.length > 0 ? diff : ['Market expertise'];
}

function inferMarketSize(text: string): string {
  if (/enterprise|large|global/i.test(text)) return 'Enterprise ($1B+)';
  if (/mid-market|scale/i.test(text)) return 'Mid-market ($100M-$1B)';

  return 'Growing market';
}

function inferOpportunities(text: string): string[] {
  const opps: string[] = [];

  if (/expand|grow|scale/i.test(text)) opps.push('Market expansion');
  if (/international|global/i.test(text)) opps.push('Global reach');
  if (/partnership|integration/i.test(text)) opps.push('Strategic partnerships');

  return opps.length > 0 ? opps : [];
}

function extractContentStrategy(headings: string[], text: string) {
  const mainThemes = headings.slice(0, 5);
  const callToActions = ['Learn More', 'Get Started', 'Contact Us'];
  const contentTone = 'Informative and engaging';
  const keyMessages = mainThemes;

  return {
    mainThemes,
    callToActions,
    contentTone,
    keyMessages,
  };
}

function calculateConfidenceScores(data: SimpleScrapedData, mission: string, voice: any) {
  const hasRealData = data.headings.length > 0 && data.colors.length > 0;
  const baseScore = hasRealData ? 80 : 60;

  return {
    visual: hasRealData ? 85 : 70,
    positioning: hasRealData ? 80 : 65,
    tone: hasRealData ? 85 : 70,
    overall: baseScore,
  };
}

function inferPositioning(text: string, mission: string): string {
  const allText = (text + ' ' + mission).toLowerCase();

  if (/premium|luxury|exclusive/i.test(allText)) return 'Premium market leader';
  if (/affordable|budget|value/i.test(allText)) return 'Value provider';
  if (/innovative|disrupting|breakthrough/i.test(allText)) return 'Innovation pioneer';

  return 'Quality-focused provider';
}

function inferCompetitors(text: string): string[] {
  const competitors: string[] = [];

  if (/amazon|walmart|target/i.test(text)) competitors.push('Major retailers');
  if (/apple|microsoft|google/i.test(text)) competitors.push('Tech giants');

  return competitors.length > 0 ? competitors : ['Industry competitors'];
}
