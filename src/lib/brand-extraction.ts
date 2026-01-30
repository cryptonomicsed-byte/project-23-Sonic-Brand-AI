import { BrandDNA } from '$types';
import { callLLM, getBrandExtractionPrompt } from './llm-sdk';

// Extract colors from CSS
function extractColors(html: string): string[] {
  const colorRegex = /#[0-9a-f]{6}|rgb\([^)]+\)|hsl\([^)]+\)/gi;
  const matches = html.match(colorRegex) || [];
  const unique = [...new Set(matches)];
  return unique.slice(0, 10);
}

// Extract fonts from CSS
function extractFonts(html: string): string[] {
  const fontRegex = /font-family:\s*['"]*([^'";\n,]+)/gi;
  const matches = html.match(fontRegex) || [];
  const fonts = matches
    .map(m => m.replace(/font-family:\s*['"]*/, '').trim())
    .filter(f => f.length > 0);
  return [...new Set(fonts)].slice(0, 5);
}

// Extract logo URL
function extractLogo(html: string): string | undefined {
  const logoRegex = /(logo|brand|icon)\.(?:png|jpg|svg|webp)/i;
  const match = html.match(logoRegex);
  return match ? match[0] : undefined;
}

// Get base URL from full URL
function getBaseUrl(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

export async function extractBrandDNA(url: string, llmModel: string): Promise<BrandDNA> {
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }

  // 1. Fetch website content
  let html: string;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // 2. Use LLM to analyze and extract brand DNA
  const prompt = getBrandExtractionPrompt(html);
  let analysis: BrandDNA;
  
  try {
    const response = await callLLM({
      model: llmModel,
      prompt,
      temperature: 0.3,
      maxTokens: 2000,
    });

    // Parse JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    
    analysis = JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error(`LLM analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // 3. Extract visual assets
  const colors = extractColors(html);
  const fonts = extractFonts(html);
  const logoUrl = extractLogo(html);

  // Merge extracted assets with LLM analysis
  return {
    ...analysis,
    identity: {
      ...analysis.identity,
      colors: colors.length > 0 ? colors : analysis.identity.colors || [],
      fonts: fonts.length > 0 ? fonts : analysis.identity.fonts || [],
      logoUrl: logoUrl || analysis.identity.logoUrl,
    },
  };
}

// Validate extracted brand DNA
export function validateBrandDNA(dna: any): dna is BrandDNA {
  return (
    dna.core &&
    dna.identity &&
    dna.voice &&
    dna.audience &&
    dna.market &&
    typeof dna.core.mission === 'string' &&
    Array.isArray(dna.identity.colors) &&
    Array.isArray(dna.voice.tone)
  );
}
