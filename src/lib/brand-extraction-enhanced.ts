/**
 * Enhanced Extraction Service (Feature 1)
 * Combines real web scraping with intelligent LLM analysis
 * 
 * Flow:
 * 1. Scrape actual website data (HTML, CSS, content, assets)
 * 2. Build enriched prompt with real data
 * 3. Send to LLM for intelligent analysis
 * 4. Return comprehensive BrandDNA profile
 */

import { advancedScraperService, type ScraperResult } from './scraper';
import { callLLM } from './llm-sdk';
import { extractBrandDataFromScraper } from './fallback-extractor';

interface EnhancedExtractionConfig {
  useRealScraping: boolean;
  llmModel?: string;
  temperature?: number;
}

class EnhancedExtractionService {
  /**
   * Build intelligent extraction prompt from scraped data
   */
  private buildEnhancedPrompt(scraperData: ScraperResult, brandName: string): string {
    const {
      metadata,
      styling,
      content,
      assets,
      social,
      text,
    } = scraperData;

    // Format styling information
    const colorPalette = styling.colors
      .slice(0, 5)
      .map((c) => `${c.name} (${c.hex})`)
      .join(', ');

    const fontStack = styling.fonts
      .slice(0, 3)
      .map((f) => `${f.family} (${f.usage})`)
      .join(', ');

    // Format content analysis
    const mainMessages = content.messaging.slice(0, 3).join(' | ');
    const ctas = content.callToActions.join(', ');
    const keyPhrases = content.keyPhrases.join(', ');

    // Create structured data summary
    const dataContext = `
=== REAL WEBSITE DATA EXTRACTION ===

Website Title: ${metadata.title}
Meta Description: ${metadata.description}
Keywords: ${metadata.keywords.filter(k => k.trim()).join(', ') || 'Auto-detected'}

=== VISUAL BRANDING DETECTED ===
Primary Colors: ${colorPalette}
Typography: ${fontStack}
Design Assets: ${assets.logos.length} logos, ${assets.heroImages.length} hero images
Social Presence: ${social.links.length} social profiles (${social.links.map((s) => s.platform).join(', ')})

=== CONTENT ANALYSIS ===
Main Headlines: ${content.headings.slice(0, 3).join(' | ')}
Core Messaging: ${mainMessages}
Calls to Action: ${ctas || 'Standard CTAs'}
Key Themes: ${keyPhrases}

=== BRAND VOICE INDICATORS ===
Content Tone: ${this.analyzeTone(text)}
Message Frequency: ${content.messaging.length} distinct messaging blocks
Engagement Level: ${this.analyzeEngagement(content)}

=== ADDITIONAL CONTEXT ===
Raw Page Content (first 2000 chars):
${text.substring(0, 2000)}
`;

    // Enhanced prompt that uses real data
    const prompt = `You are a brand strategist analyzing real website data. Use the EXTRACTED DATA below to create an accurate BrandDNA profile.

${dataContext}

Now analyze this data and create a comprehensive JSON BrandDNA profile. Be specific and accurate based on the real data provided.

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "core": {
    "mission": "Brand mission from content",
    "vision": "Brand vision",
    "values": ["value1", "value2", "value3"],
    "tagline": "Short tagline"
  },
  "identity": {
    "colors": ["#hex1", "#hex2"],
    "fonts": ["font1", "font2"],
    "visualStyle": "Design description",
    "logoUrl": "Logo URL if found"
  },
  "voice": {
    "tone": ["adjective1", "adjective2"],
    "keywords": ["keyword1", "keyword2"],
    "writingStyle": "Style description"
  },
  "audience": {
    "demographics": "Target demographics",
    "psychographics": "Values and motivations",
    "painPoints": ["pain1", "pain2"]
  },
  "market": {
    "positioning": "Market positioning",
    "competitors": ["competitor1", "competitor2"]
  }
}`;

    return prompt;
  }

  /**
   * Analyze writing tone from text
   */
  private analyzeTone(text: string): string {
    const formal = /professional|corporate|enterprise|business/i.test(text);
    const casual = /fun|cool|awesome|let's|don't|we're/i.test(text);
    const technical = /api|data|algorithm|framework|protocol/i.test(text);
    const creative = /imagine|inspire|creative|design|beautiful|elegant/i.test(text);

    const tones = [];
    if (formal) tones.push('formal');
    if (casual) tones.push('casual');
    if (technical) tones.push('technical');
    if (creative) tones.push('creative');

    return tones.length > 0 ? tones.join(', ') : 'neutral';
  }

  /**
   * Analyze engagement level
   */
  private analyzeEngagement(content: { messaging: string[]; callToActions: string[] }): string {
    const msgCount = content.messaging.length;
    const ctaCount = content.callToActions.length;
    const score = msgCount + ctaCount * 2; // CTAs weighted higher

    if (score > 10) return 'High engagement';
    if (score > 5) return 'Medium engagement';
    return 'Low engagement';
  }

  /**
   * Main enhanced extraction method
   */
  async extractBrandDNA(
    url: string,
    brandName: string = '',
    llmModel: string = 'gpt-4-turbo',
    llmProvider?: string
  ): Promise<any> {
    // Auto-prefix https:// if missing
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      console.log('[EnhancedExtraction] Starting extraction...');
      console.log('[EnhancedExtraction] Website:', normalizedUrl);
      console.log('[EnhancedExtraction] Brand:', brandName || 'auto-detect');

      // Step 1: Real web scraping
      console.log('[EnhancedExtraction] ✓ Starting web scraper...');
      let scraperData: ScraperResult | null = null;
      
      try {
        scraperData = await advancedScraperService.scrape(normalizedUrl);
        console.log('[EnhancedExtraction] ✓ Scraper returned data');
      } catch (scraperError) {
        console.warn('[EnhancedExtraction] ⚠ Scraper failed, continuing with fallback:', scraperError);
      }

      // Step 2: Build enhanced prompt
      const prompt = this.buildEnhancedPrompt(
        scraperData || {
          html: '',
          text: '',
          metadata: { title: brandName, description: '', keywords: [] },
          styling: { colors: [], fonts: [], cssVariables: {} },
          content: { headings: [], keyPhrases: [], messaging: [], callToActions: [] },
          assets: { logos: [], heroImages: [], icons: [] },
          social: { links: [] },
        },
        brandName || 'Brand'
      );

      // Step 3: Call LLM (optional - has fallback)
      console.log('[EnhancedExtraction] ✓ Attempting LLM analysis...');
      let response: string = '';
      
      try {
        const llmResponse = await callLLM({
          model: llmModel,
          prompt,
          provider: llmProvider as any,
          temperature: 0.3,
          maxTokens: 2000,
        });
        response = llmResponse.content;
        console.log('[EnhancedExtraction] ✓ LLM response received');
      } catch (llmError: any) {
        console.warn('[EnhancedExtraction] ⚠ LLM analysis not available:', llmError?.message);
        console.log('[EnhancedExtraction] Will use fallback extraction from scraped data');
      }

      // Step 4: Parse and normalize
      const dna = this.parseAndNormalize(response, scraperData, normalizedUrl, brandName);
      console.log('[EnhancedExtraction] ✓ Extraction complete:', dna.core.mission);

      return dna;
    } catch (error: any) {
      console.error('[EnhancedExtraction] Error:', error);
      throw new Error(`Enhanced extraction failed: ${error?.message}`);
    }
  }

  /**
   * Parse LLM response and normalize with scraper data
   */
  private parseAndNormalize(
    response: string,
    scraperData: ScraperResult | null,
    url: string,
    brandName: string
  ): any {
    // If no LLM response, use fallback immediately
    if (!response || response.trim().length === 0) {
      console.log('[EnhancedExtraction] No LLM response, using fallback extraction');
      if (scraperData) {
        return extractBrandDataFromScraper(scraperData, url);
      }
      // If no scraper data either, return generic fallback
      return this.getGenericFallback(url, brandName);
    }

    try {
      // Extract JSON
      let jsonStr = response.trim();
      
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }

      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const metadata = scraperData?.metadata || {};

      return {
        ...parsed,
        id: `dna_${Date.now()}`,
        websiteUrl: url,
        createdAt: new Date().toISOString(),
        scrapedMetadata: {
          pageTitle: metadata.title,
          metaDescription: metadata.description,
          ogImage: metadata.ogImage,
        },
        detectedAssets: scraperData ? {
          logos: scraperData.assets.logos.slice(0, 3),
          heroImages: scraperData.assets.heroImages.slice(0, 3),
        } : undefined,
        socialPresence: scraperData?.social.links.map(link => ({
          platform: link.platform,
          url: link.url,
        })),
      };
    } catch (error: any) {
      console.error('[EnhancedExtraction] LLM parse error:', error.message);
      
      // Use fallback extractor if LLM parsing fails
      if (scraperData) {
        console.log('[EnhancedExtraction] Using fallback extraction from scraped data');
        return extractBrandDataFromScraper(scraperData, url);
      }
      
      // Ultimate fallback if no scraper data
      console.log('[EnhancedExtraction] No scraper data available, using generic fallback');
      return {
        core: {
          mission: brandName || 'Professional brand',
          vision: 'Quality-focused brand committed to excellence',
          values: ['Innovation', 'Quality', 'Customer Focus'],
          tagline: 'Excellence in every detail',
        },
        identity: {
          colors: ['#3B82F6', '#10B981'],
          fonts: ['Inter', 'System UI'],
          visualStyle: 'Modern and professional',
          logoUrl: undefined,
        },
        voice: {
          tone: ['professional', 'approachable'],
          keywords: ['quality', 'innovation'],
          writingStyle: 'Clear and concise',
        },
        audience: {
          demographics: 'Business professionals and decision makers',
          psychographics: 'Value quality and innovation',
          painPoints: ['efficiency', 'reliability'],
        },
        market: {
          positioning: 'Professional provider',
          competitors: ['Industry competitors'],
        },
        id: `dna_${Date.now()}`,
        websiteUrl: url,
        createdAt: new Date().toISOString(),
        extractionMethod: 'generic-fallback',
      };
    }
  }

  /**
   * Generic fallback when no scraper data is available
   */
  private getGenericFallback(url: string, brandName: string): any {
    return {
      core: {
        mission: brandName || 'Professional brand',
        vision: 'Quality-focused brand committed to excellence',
        values: ['Innovation', 'Quality', 'Customer Focus'],
        tagline: 'Excellence in every detail',
      },
      identity: {
        colors: ['#3B82F6', '#10B981'],
        fonts: ['Inter', 'System UI'],
        visualStyle: 'Modern and professional',
        logoUrl: undefined,
      },
      voice: {
        tone: ['professional', 'approachable'],
        keywords: ['quality', 'innovation'],
        writingStyle: 'Clear and concise',
      },
      audience: {
        demographics: 'Business professionals and decision makers',
        psychographics: 'Value quality and innovation',
        painPoints: ['efficiency', 'reliability'],
      },
      market: {
        positioning: 'Professional provider',
        competitors: ['Industry competitors'],
      },
      id: `dna_${Date.now()}`,
      websiteUrl: url,
      createdAt: new Date().toISOString(),
      extractionMethod: 'generic-fallback',
    };
  }
}

export const enhancedExtractionService = new EnhancedExtractionService();
export type { EnhancedExtractionConfig };
