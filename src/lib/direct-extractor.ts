/**
 * Direct Extractor
 * Extract brand data directly from DOM without CORS proxy
 * Works in browser with actual website content
 */

export function extractBrandFromDOM(): any {
  try {
    // Get page title and meta description
    const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                  document.querySelector('title')?.textContent ||
                  document.title ||
                  'Brand';
    
    const description = document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                       document.querySelector('meta[name="description"]')?.getAttribute('content') ||
                       '';

    // Extract main headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(h => h.textContent?.trim())
      .filter(text => text && text.length > 0)
      .slice(0, 5);

    // Extract text content
    const bodyText = document.body.innerText.substring(0, 10000);

    // Extract colors from computed styles
    const colors = extractColorsFromDOM();
    
    // Extract fonts from body and headings
    const fonts = extractFontsFromDOM();

    // Extract CTAs
    const ctas = extractCTAsFromDOM();

    // Extract keywords from content
    const keywords = extractKeywords(bodyText);

    // Analyze tone
    const tone = analyzeTone(bodyText);

    // Infer audience
    const { demographics, psychographics, painPoints } = inferAudience(bodyText);

    // Get logo
    const logo = extractLogoUrl();

    // Extract social links
    const socialLinks = extractSocialLinks();

    return {
      core: {
        mission: description || headings[0] || title,
        vision: 'Committed to delivering value and innovation',
        values: ['Quality', 'Innovation', 'Customer Focus'],
        tagline: title,
      },
      identity: {
        colors: colors.length > 0 ? colors : ['#3B82F6', '#10B981'],
        fonts: fonts.length > 0 ? fonts : ['System UI'],
        visualStyle: 'Modern and professional',
        logoUrl: logo,
      },
      voice: {
        tone: tone.length > 0 ? tone : ['professional'],
        keywords: keywords.slice(0, 5),
        writingStyle: 'Clear and engaging',
      },
      audience: {
        demographics,
        psychographics,
        painPoints,
      },
      market: {
        positioning: 'Market leader',
        competitors: ['Industry competitors'],
      },
      id: `dna_${Date.now()}`,
      websiteUrl: window.location.href,
      createdAt: new Date().toISOString(),
      extractionMethod: 'dom-direct',
    };
  } catch (error) {
    console.error('[DirectExtractor] Error:', error);
    throw new Error('Failed to extract brand data from page');
  }
}

function extractColorsFromDOM(): string[] {
  const colors = new Set<string>();
  const visited = new Set<string>();

  // Get colors from computed styles
  const elements = document.querySelectorAll('*');
  let count = 0;
  
  for (const el of elements) {
    if (count >= 50) break;
    
    const computed = window.getComputedStyle(el);
    const bgColor = computed.backgroundColor;
    const textColor = computed.color;
    const borderColor = computed.borderColor;

    [bgColor, textColor, borderColor].forEach(color => {
      if (color && color !== 'rgba(0, 0, 0, 0)' && !visited.has(color)) {
        visited.add(color);
        const hex = rgbToHex(color);
        if (hex && !hex.includes('0, 0, 0') && !hex.includes('255, 255, 255')) {
          colors.add(hex);
        }
        count++;
      }
    });
  }

  return Array.from(colors).slice(0, 8);
}

function extractFontsFromDOM(): string[] {
  const fonts = new Set<string>();
  const elements = document.querySelectorAll('body, h1, h2, h3, p');

  for (const el of elements) {
    const fontFamily = window.getComputedStyle(el).fontFamily;
    if (fontFamily) {
      const cleanFont = fontFamily
        .split(',')[0]
        .replace(/['"]/g, '')
        .trim();
      if (cleanFont && !cleanFont.toLowerCase().includes('serif')) {
        fonts.add(cleanFont);
      }
    }
  }

  return Array.from(fonts).slice(0, 3);
}

function extractCTAsFromDOM(): string[] {
  const ctas: string[] = [];
  const buttons = document.querySelectorAll('button, a[role="button"], [class*="cta"], [class*="btn"]');

  for (const btn of buttons) {
    const text = btn.textContent?.trim();
    if (text && text.length > 3 && text.length < 50) {
      ctas.push(text);
    }
  }

  return ctas.slice(0, 5);
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const freq: Record<string, number> = {};

  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function analyzeTone(text: string): string[] {
  const tones: string[] = [];
  const lower = text.toLowerCase();

  if (/professional|corporate|enterprise|business|solution/i.test(lower)) tones.push('professional');
  if (/fun|cool|awesome|exciting|vibrant/i.test(lower)) tones.push('energetic');
  if (/creative|design|beautiful|elegant/i.test(lower)) tones.push('creative');
  if (/innovative|cutting-edge|breakthrough|advanced/i.test(lower)) tones.push('innovative');
  if (/care|support|help|community/i.test(lower)) tones.push('empathetic');
  if (/expert|trusted|reliable|secure/i.test(lower)) tones.push('authoritative');

  return tones.length > 0 ? tones : ['professional'];
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

  if (/student|education|learn|course/i.test(lower)) {
    demographics = 'Students and learners';
    psychographics = 'Seeking knowledge and growth';
    painPoints[0] = 'accessibility';
  }
  if (/enterprise|corporate|b2b/i.test(lower)) {
    demographics = 'Enterprise organizations';
    psychographics = 'Focus on ROI and scalability';
    painPoints[0] = 'integration';
  }
  if (/creator|freelance|startup/i.test(lower)) {
    demographics = 'Creators and entrepreneurs';
    psychographics = 'Value autonomy and efficiency';
    painPoints[0] = 'cost-effectiveness';
  }
  if (/consumer|customer|shop|buy/i.test(lower)) {
    demographics = 'End consumers';
    psychographics = 'Seek convenience and value';
    painPoints[0] = 'usability';
  }

  return { demographics, psychographics, painPoints };
}

function extractLogoUrl(): string | undefined {
  const logoSelectors = [
    'img[alt*="logo" i]',
    'img[src*="logo" i]',
    '[class*="logo"] img',
    'header img',
    'nav img',
  ];

  for (const selector of logoSelectors) {
    const logo = document.querySelector(selector) as HTMLImageElement;
    if (logo?.src) {
      return logo.src;
    }
  }

  return undefined;
}

function extractSocialLinks(): Array<{ platform: string; url: string }> {
  const socials: Array<{ platform: string; url: string }> = [];
  const links = document.querySelectorAll('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"], a[href*="youtube"]');

  for (const link of links) {
    const href = link.getAttribute('href');
    if (href) {
      let platform = 'social';
      if (href.includes('facebook')) platform = 'facebook';
      if (href.includes('twitter')) platform = 'twitter';
      if (href.includes('linkedin')) platform = 'linkedin';
      if (href.includes('instagram')) platform = 'instagram';
      if (href.includes('youtube')) platform = 'youtube';

      socials.push({ platform, url: href });
    }
  }

  return socials;
}

function rgbToHex(rgb: string): string {
  try {
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '';

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  } catch {
    return '';
  }
}
