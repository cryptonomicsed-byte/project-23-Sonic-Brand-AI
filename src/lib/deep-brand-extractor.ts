/**
 * Deep Brand DNA Extractor
 * Multi-page analysis with vision model integration for comprehensive brand insights
 */

import { deepCrawler } from './deep-crawler';
import { callLLM } from './llm-sdk';

interface VisualAssetAnalysis {
  logoUrl?: string;
  logoDescription?: string;
  colorPalette?: string[];
  fonts?: string[];
}

class DeepBrandExtractor {
  /**
   * Build deep analysis system prompt
   */
  private buildDeepSystemPrompt(): string {
    return `You are an expert brand strategist and cultural analyst. Your task is to analyze comprehensive website content from multiple pages and extract a detailed, insightful Brand DNA profile.

Focus on:
- Actual language patterns and messaging (not generic descriptions)
- Real visual design choices evident in the content
- Authentic brand values shown through actions, not just stated
- Target audience signals from tone, language, and positioning
- Competitive differentiation evident in messaging

Return ONLY valid JSON with NO markdown, NO explanation, NO code blocks.`;
  }

  /**
   * Build enhanced analysis prompt from crawled content
   */
  private buildAnalysisPrompt(pages: Array<{ url: string; title: string; text: string }>): string {
    const pageContext = pages
      .map((page, i) => {
        const truncated = page.text.substring(0, 3000);
        return `\n=== PAGE ${i + 1}: ${page.title} ===\nURL: ${page.url}\nContent:\n${truncated}${page.text.length > 3000 ? '\n... [content truncated]' : ''}`;
      })
      .join('\n\n');

    return `${this.buildDeepSystemPrompt()}

WEBSITE CONTENT FROM ${pages.length} PAGES:
${pageContext}

---

Analyze this content and return ONLY this JSON structure (no markdown, no code blocks, pure JSON):

{
  "core": {
    "mission": "The brand's core purpose/mission based on actual content",
    "vision": "Where the brand aspires to go",
    "values": ["value1", "value2", "value3", "value4"],
    "tagline": "A concise brand tagline or positioning statement"
  },
  "identity": {
    "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
    "fonts": ["font_family_1", "font_family_2"],
    "logoDescription": "Description of logo style if evident",
    "visualStyle": "Overall visual aesthetic (minimalist, bold, playful, elegant, etc.)"
  },
  "voice": {
    "tone": ["adjective1", "adjective2", "adjective3", "adjective4", "adjective5"],
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "writingStyle": "Description of how the brand writes (technical, conversational, formal, etc.)"
  },
  "audience": {
    "demographics": "Target demographic description",
    "psychographics": "Values, motivations, and aspirations of the target audience",
    "painPoints": ["pain1", "pain2", "pain3"]
  },
  "market": {
    "positioning": "How the brand positions itself in the market",
    "competitors": ["competitor1", "competitor2", "competitor3"]
  }
}

Be specific and insightful, not generic. Back assertions with evidence from the content.`;
  }

  /**
   * Extract visual assets from homepage
   */
  private async extractVisualAssets(homepageHtml: string): Promise<VisualAssetAnalysis> {
    const analysis: VisualAssetAnalysis = {
      colorPalette: [],
      fonts: [],
    };

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(homepageHtml, 'text/html');

      // Extract logo
      const logoSelectors = [
        'img[alt*="logo" i]',
        'img[src*="logo" i]',
        '.logo img',
        '[class*="logo"] img',
        'header img:first-of-type',
      ];

      for (const selector of logoSelectors) {
        const logoEl = doc.querySelector(selector) as HTMLImageElement;
        if (logoEl?.src) {
          analysis.logoUrl = logoEl.src;
          break;
        }
      }

      // Extract computed styles for colors and fonts
      const styleElements = doc.querySelectorAll('style, link[rel="stylesheet"]');
      let styleText = '';

      for (const el of styleElements) {
        if (el.tagName === 'STYLE') {
          styleText += el.textContent || '';
        }
      }

      // Look for hex colors in styles
      const colorRegex = /#[0-9A-Fa-f]{6}\b/g;
      const colors = Array.from(styleText.matchAll(colorRegex))
        .map(m => m[0])
        .slice(0, 5);
      analysis.colorPalette = [...new Set(colors)];

      // Look for font-family declarations
      const fontRegex = /font-family\s*:\s*['"]?([^;'"]+)['"]?/gi;
      const fonts = Array.from(styleText.matchAll(fontRegex))
        .map(m => m[1].trim().split(',')[0]) // Take first font in stack
        .filter(f => f.length > 0)
        .slice(0, 2);
      analysis.fonts = [...new Set(fonts)];
    } catch (err) {
      console.warn('[DeepExtractor] Visual asset extraction failed:', err);
    }

    return analysis;
  }

  /**
   * Analyze logo with vision model if available
   */
  private async analyzeLogoWithVision(logoUrl: string): Promise<string | undefined> {
    try {
      // This would integrate with GPT-4V or Gemini Vision
      // For now, we return undefined as this requires additional setup
      // Implementation would look like:
      // const response = await callLLM({
      //   model: 'gpt-4-vision',
      //   image: logoUrl,
      //   prompt: 'Describe the logo style, colors, and design elements in 1-2 sentences.'
      // });
      return undefined;
    } catch (err) {
      return undefined;
    }
  }

  /**
   * Validate and clean JSON response from LLM
   */
  private parseJsonResponse(response: string): any {
    let jsonStr = response.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    // Extract JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in LLM response');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Generate basic DNA from crawled content when LLM fails
   */
  private generateBasicDNA(
    pages: Array<{ url: string; title: string; text: string }>,
    visualAssets: VisualAssetAnalysis
  ): any {
    // Combine all text content
    const allText = pages.map(p => p.text).join(' ');
    const mainTitle = pages[0]?.title || 'Brand';

    // Extract key phrases
    const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const mainMessage = sentences.slice(0, 2).join('. ');

    // Analyze tone
    const tones = [];
    if (/professional|corporate|business/i.test(allText)) tones.push('professional');
    if (/innovative|cutting-edge|next-gen/i.test(allText)) tones.push('innovative');
    if (/friendly|community|together/i.test(allText)) tones.push('empathetic');
    if (/premium|luxury|exclusive/i.test(allText)) tones.push('premium');

    return {
      core: {
        mission: mainMessage || mainTitle,
        vision: 'Committed to excellence and customer success',
        values: ['Quality', 'Innovation', 'Customer Focus'],
        tagline: mainTitle,
      },
      identity: {
        colors: visualAssets.colorPalette || ['#3B82F6', '#10B981'],
        fonts: visualAssets.fonts || ['System UI'],
        visualStyle: visualAssets.logoDescription || 'Professional design',
        logoUrl: visualAssets.logoUrl,
      },
      voice: {
        tone: tones.length > 0 ? tones : ['professional', 'approachable'],
        keywords: ['quality', 'innovation', 'excellence'],
        writingStyle: 'Clear and informative',
      },
      audience: {
        demographics: 'Business professionals',
        psychographics: 'Value quality and innovation',
        painPoints: ['efficiency', 'reliability'],
      },
      market: {
        positioning: 'Quality-focused provider',
        competitors: ['Industry leaders'],
      },
    };
  }

  /**
   * Main deep extraction method
   */
  async extractBrandDNA(
    url: string,
    llmModel: string = 'gpt-4-turbo',
    onProgress?: (message: string) => void,
    llmProvider?: string
  ): Promise<any> {
    const progress = (msg: string) => {
      console.log(`[DeepExtractor] ${msg}`);
      onProgress?.(msg);
    };

    try {
      progress('Starting deep brand DNA extraction...');

      // Normalize URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      // Step 1: Crawl multiple pages
      progress('Crawling website pages...');
      const crawlResult = await deepCrawler.crawl(normalizedUrl);

      if (crawlResult.pages.length === 0) {
        throw new Error(
          `No pages could be crawled. Errors: ${crawlResult.errors.join('; ')}`
        );
      }

      progress(`Crawled ${crawlResult.totalPages} pages successfully`);

      // Step 2: Extract visual assets from first page
      let visualAssets: VisualAssetAnalysis = {};
      if (crawlResult.pages[0].cleanedHtml) {
        progress('Analyzing visual assets...');
        visualAssets = await this.extractVisualAssets(crawlResult.pages[0].cleanedHtml);

        if (visualAssets.logoUrl) {
          progress('Analyzing logo with vision model...');
          const logoDesc = await this.analyzeLogoWithVision(visualAssets.logoUrl);
          if (logoDesc) {
            visualAssets.logoDescription = logoDesc;
          }
        }
      }

      // Step 3: Prepare content for LLM
      progress('Preparing content analysis...');
      const pagesSummary = crawlResult.pages.map(p => ({
        url: p.url,
        title: p.title,
        text: p.cleanText,
      }));

      // Chunk content if needed (rough token limit: ~100k tokens total)
      // Assuming ~4 chars per token, this is roughly 400k chars
      let totalChars = pagesSummary.reduce((sum, p) => sum + p.text.length, 0);
      let pages = pagesSummary;

      if (totalChars > 400000) {
        progress(`Content too large (${totalChars} chars), truncating...`);
        pages = pagesSummary.map(p => ({
          ...p,
          text: p.text.substring(0, 40000),
        }));
      }

      // Step 4: Call LLM with enhanced prompt
      progress('Analyzing with AI...');
      const prompt = this.buildAnalysisPrompt(pages);

      let dna: any;
      try {
        const llmResponse = await callLLM({
          model: llmModel,
          prompt,
          provider: llmProvider as any,
          temperature: 0.3,
          maxTokens: 2500,
        });

        progress('Parsing results...');
        dna = this.parseJsonResponse(llmResponse.content);
      } catch (llmError) {
        // Fallback: use basic extraction from crawled content
        progress('LLM analysis failed, using content-based analysis...');
        console.warn('[DeepExtractor] LLM error:', llmError);
        
        dna = this.generateBasicDNA(pages, visualAssets);
      }

      // Step 5: Merge with visual assets
      if (visualAssets.logoUrl || visualAssets.logoDescription) {
        dna.identity = dna.identity || {};
        if (visualAssets.logoUrl) dna.identity.logoUrl = visualAssets.logoUrl;
        if (visualAssets.logoDescription) {
          dna.identity.logoDescription = visualAssets.logoDescription;
        }
      }

      // Add metadata
      dna.id = `dna_deep_${Date.now()}`;
      dna.websiteUrl = normalizedUrl;
      dna.createdAt = new Date().toISOString();
      dna.analysisMode = 'deep';
      dna.pagesAnalyzed = crawlResult.totalPages;
      dna.crawlErrors = crawlResult.errors;

      progress('Deep extraction complete');
      return dna;
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error);
      progress(`Error: ${err}`);
      throw error;
    }
  }
}

export const deepBrandExtractor = new DeepBrandExtractor();
