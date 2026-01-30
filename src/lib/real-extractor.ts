/**
 * Real Brand DNA Extractor
 * Extracts actual brand data from website content
 * No LLM required - works with real scraped data
 */

import { scrapeWebsite, type SimpleScrapedData } from './simple-scraper';

export async function extractRealBrandDNA(url: string): Promise<any> {
  try {
    console.log('[RealExtractor] Starting extraction for:', url);

    // Step 1: Scrape the website
    const scrapedData = await scrapeWebsite(url);

    // Step 2: Analyze and extract brand DNA
    const dna = analyzeBrandDNA(scrapedData, url);

    console.log('[RealExtractor] Extraction complete');
    return dna;
  } catch (error) {
    console.error('[RealExtractor] Error:', error);
    throw error;
  }
}

function analyzeBrandDNA(data: SimpleScrapedData, url: string): any {
  const { title, description, text, headings, colors, fonts, images } = data;

  // Core Identity - get richer mission from content
  const mission = buildMission(headings, description, text);
  const vision = buildVision(headings, text);
  const values = extractValues(text);
  const tagline = buildTagline(headings, title, text);

  // Visual Identity
  const extractedColors = colors.length > 0 ? colors : ['#3B82F6', '#10B981'];
  const extractedFonts = fonts.length > 0 ? fonts : ['System UI'];
  const visualStyle = determineVisualStyle(colors, text);
  const logoUrl = images.length > 0 ? images[0] : undefined;

  // Voice & Messaging
  const tone = analyzeTone(text);
  const keywords = extractKeywords(text);
  const writingStyle = analyzeWritingStyle(text);

  // Audience
  const { demographics, psychographics, painPoints } = inferAudience(text);

  // Market
  const positioning = inferPositioning(text, mission);
  const competitors = inferCompetitors(text);

  return {
    core: {
      mission,
      vision,
      values,
      tagline,
    },
    identity: {
      colors: extractedColors,
      fonts: extractedFonts,
      visualStyle,
      logoUrl,
    },
    voice: {
      tone,
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
    extractionMethod: 'real-content-analysis',
  };
}

function extractValues(text: string): string[] {
  const valueKeywords = [
    'innovation',
    'quality',
    'integrity',
    'customer',
    'trust',
    'excellence',
    'sustainability',
    'growth',
    'transparency',
    'reliability',
    'creativity',
    'collaboration',
    'leadership',
    'passion',
    'commitment',
  ];

  const foundValues: string[] = [];
  const lowerText = text.toLowerCase();

  for (const value of valueKeywords) {
    if (new RegExp(`\\b${value}s?\\b`, 'i').test(lowerText)) {
      foundValues.push(value.charAt(0).toUpperCase() + value.slice(1));
    }
  }

  return foundValues.length > 0
    ? foundValues.slice(0, 4)
    : ['Quality', 'Innovation', 'Customer Focus'];
}

function determineVisualStyle(colors: string[], text: string): string {
  const colorCount = colors.length;
  const lowerText = text.toLowerCase();

  if (/minimalist|clean|simple/i.test(lowerText)) return 'Minimalist and clean';
  if (/bold|vibrant|energetic/i.test(lowerText)) return 'Bold and vibrant';
  if (/elegant|sophisticated|luxury/i.test(lowerText)) return 'Elegant and sophisticated';
  if (/modern|contemporary|sleek/i.test(lowerText)) return 'Modern and sleek';
  if (/playful|fun|creative/i.test(lowerText)) return 'Playful and creative';

  if (colorCount > 8) return 'Rich and layered';
  if (colorCount > 5) return 'Multi-color design';
  if (colorCount <= 2) return 'Minimalist with limited palette';

  return 'Modern and professional';
}

function analyzeTone(text: string): string[] {
  const tones: string[] = [];
  const lower = text.toLowerCase();

  if (/professional|corporate|enterprise|business|solution/i.test(lower)) tones.push('professional');
  if (/fun|cool|awesome|exciting|vibrant|playful/i.test(lower)) tones.push('energetic');
  if (/creative|design|beautiful|elegant|aesthetic|artistic/i.test(lower)) tones.push('creative');
  if (/innovative|cutting-edge|breakthrough|revolutionary|future/i.test(lower)) tones.push('innovative');
  if (/care|support|help|community|together|human|empathy/i.test(lower)) tones.push('empathetic');
  if (/expert|trusted|reliable|secure|proven|leader|authority/i.test(lower)) tones.push('authoritative');
  if (/friendly|approachable|easy|simple|casual|relatable/i.test(lower)) tones.push('approachable');
  if (/premium|luxury|exclusive|elite|high-end|sophisticated/i.test(lower)) tones.push('premium');

  return tones.length > 0 ? tones.slice(0, 5) : ['professional', 'approachable'];
}

function extractKeywords(text: string): string[] {
  // Split into words and filter
  const words = text
    .toLowerCase()
    .match(/\b[a-z]{4,}\b/g) || [];

  // Count frequency
  const freq: Record<string, number> = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  // Remove common words
  const stopwords = new Set([
    'the', 'and', 'for', 'with', 'from', 'have', 'this', 'that',
    'your', 'their', 'which', 'they', 'would', 'about', 'more',
    'also', 'just', 'only', 'some', 'very', 'much', 'many', 'how',
    'when', 'where', 'what', 'will', 'been', 'into', 'them', 'than',
  ]);

  const keywords = Object.entries(freq)
    .filter(([word]) => !stopwords.has(word) && freq[word] > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  // If we have keywords, return capitalized
  return keywords.length > 0 
    ? keywords.map(k => k.charAt(0).toUpperCase() + k.slice(1))
    : ['Quality', 'Innovation', 'Excellence'];
}

function analyzeWritingStyle(text: string): string {
  const lowerText = text.toLowerCase();

  if (/therefore|moreover|consequently|utilize|implement|hereby/i.test(lowerText)) {
    return 'Formal and detailed';
  }
  if (/hey|let's|don't|we're|honestly|actually|kinda/i.test(lowerText)) {
    return 'Conversational and friendly';
  }
  if (/must|should|important|critical|essential/i.test(lowerText)) {
    return 'Action-oriented';
  }
  if (/imagine|discover|explore|journey|experience/i.test(lowerText)) {
    return 'Storytelling and engaging';
  }

  return 'Clear and concise';
}

function inferAudience(text: string): {
  demographics: string;
  psychographics: string;
  painPoints: string[];
} {
  const lower = text.toLowerCase();

  let demographics = 'Business professionals';
  let psychographics = 'Value quality and innovation';
  const painPoints = ['efficiency', 'reliability'];

  // Student/Educational
  if (/student|education|learn|course|training|university|school/i.test(lower)) {
    demographics = 'Students and learners';
    psychographics = 'Seeking knowledge, growth, and career development';
    painPoints[0] = 'accessibility';
  }
  // Enterprise/Corporate
  else if (/enterprise|corporate|b2b|business|organization|company|agency/i.test(lower)) {
    demographics = 'Enterprise organizations and executives';
    psychographics = 'Focus on ROI, scalability, and efficiency';
    painPoints[0] = 'integration';
  }
  // Startups/Creators
  else if (/creator|freelance|startup|entrepreneur|indie|maker|artisan/i.test(lower)) {
    demographics = 'Creators and entrepreneurs';
    psychographics = 'Value autonomy, speed, and efficiency';
    painPoints[0] = 'cost-effectiveness';
  }
  // Consumer
  else if (/consumer|customer|user|people|family|home|lifestyle|shop|buy/i.test(lower)) {
    demographics = 'End consumers and everyday users';
    psychographics = 'Seek convenience, value, and quality';
    painPoints[0] = 'usability';
  }
  // Healthcare
  else if (/health|medical|patient|doctor|clinic|hospital|care/i.test(lower)) {
    demographics = 'Healthcare professionals and patients';
    psychographics = 'Value trust, accuracy, and compassion';
    painPoints[0] = 'accuracy';
  }

  painPoints.push('cost-effectiveness');

  return { demographics, psychographics, painPoints };
}

function inferPositioning(text: string, mission: string): string {
  const allText = (text + ' ' + mission).toLowerCase();

  if (/premium|luxury|exclusive|elite|high-end|best/i.test(allText)) {
    return 'Premium market leader';
  }
  if (/affordable|budget|cheap|value|accessible|economical/i.test(allText)) {
    return 'Value-focused provider';
  }
  if (/innovative|disrupt|revolution|next-gen|cutting-edge|breakthrough/i.test(allText)) {
    return 'Innovation pioneer';
  }
  if (/sustainable|eco|green|ethical|responsible|conscious/i.test(allText)) {
    return 'Sustainability-focused leader';
  }
  if (/reliable|trusted|secure|proven|established|leader/i.test(allText)) {
    return 'Trusted industry authority';
  }

  return 'Quality-focused provider';
}

function inferCompetitors(text: string): string[] {
  // Common competitor keywords to detect
  const competitors: string[] = [];

  if (/amazon|walmart|target|best buy/i.test(text)) competitors.push('Major retailers');
  if (/apple|microsoft|google|amazon|meta|tesla/i.test(text)) competitors.push('Tech giants');
  if (/startup|competitor|rival|alternative/i.test(text)) competitors.push('Direct competitors');
  if (/industry leader|market leader|established/i.test(text)) competitors.push('Market leaders');

  return competitors.length > 0 ? competitors : ['Industry competitors'];
}

function buildMission(headings: string[], description: string, text: string): string {
  // Mission: Core purpose/what they do
  if (description && description.length > 30) {
    return description;
  }

  // Extract from text - look for purpose statements
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20 && s.trim().length < 250);
  
  // Look for action-oriented sentences early in text
  for (const sentence of sentences.slice(0, 3)) {
    const trimmed = sentence.trim();
    if (/(helps|provides|connects|enables|serves|offers|delivers)/i.test(trimmed)) {
      return trimmed;
    }
  }

  // Fallback to first substantial heading
  if (headings.length > 0) {
    const substantialHeadings = headings.filter(h => h.length > 20 && h.length < 150);
    return substantialHeadings[0] || headings[0];
  }

  return sentences[0]?.trim() || 'Professional brand';
}

function buildVision(headings: string[], text: string): string {
  // Vision: Where they're going, future state
  const visionKeywords = ['vision', 'future', 'innovate', 'transform', 'reimagine', 'leading', 'sustainable', 'next', 'tomorrow'];
  
  // Look in headings
  for (const heading of headings.slice(1, 5)) {
    const lowerHeading = heading.toLowerCase();
    if (visionKeywords.some(kw => lowerHeading.includes(kw))) {
      return heading;
    }
  }

  // Look in text for vision-oriented content
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
  for (const sentence of sentences.slice(1, 5)) {
    const lower = sentence.toLowerCase();
    if (visionKeywords.some(kw => lower.includes(kw))) {
      return sentence.trim();
    }
  }

  // Look for aspirational language
  for (const sentence of sentences.slice(0, 10)) {
    if (/(making|creating|building|growing|expanding|revolutionizing)/i.test(sentence)) {
      return sentence.trim();
    }
  }

  // Default vision based on content
  if (headings.length > 1) {
    const alternateHeadings = headings.filter(h => h.length > 30 && h.length < 150);
    if (alternateHeadings.length > 1) {
      return alternateHeadings[1];
    }
  }

  return 'Leading with innovation and customer focus';
}

function buildTagline(headings: string[], title: string, text: string): string {
  // Tagline: Short, punchy brand promise
  const shortHeadings = headings.filter(h => h.length < 100 && h.length > 10);
  
  // Look for value proposition
  const valuePatterns = /(best|quality|great|amazing|perfect|innovative|fast|easy|simple|powerful|trusted|reliable|secure|authentic|unique|exclusive)/i;
  const valueHeadings = shortHeadings.filter(h => valuePatterns.test(h));
  
  if (valueHeadings.length > 0) {
    return valueHeadings[0];
  }

  // Look for action-oriented taglines
  const actionPatterns = /(discover|explore|experience|transform|unlock|achieve|succeed|grow|connect|enjoy)/i;
  const actionHeadings = shortHeadings.filter(h => actionPatterns.test(h));
  
  if (actionHeadings.length > 0) {
    return actionHeadings[0];
  }

  // Last resort
  if (shortHeadings.length > 0) {
    return shortHeadings[Math.min(2, shortHeadings.length - 1)];
  }

  return title || 'Excellence in every detail';
}
